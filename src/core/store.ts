/**
 * Стор ядра: снимок данных в памяти + запись изменений в хранилище.
 *
 * Все изменения проходят через `commit` — одна запись в zustand и одна пачка в хранилище.
 * Запись в хранилище откладывается до конца текущего тика, поэтому быстрые серии изменений
 * (например, удаление сферы вместе с целями) уходят одной транзакцией.
 */
import { create } from 'zustand';
import { todayStr } from '../utils/dates';
import { fromLegacyV4 } from './migrate';
import {
  COLLECTIONS,
  emptySnapshot,
  type AnyRecord,
  type CollectionName,
  type Collections,
  type ISODate,
  type Profile,
  type RecordMeta,
  type Snapshot,
} from './model';
import { META, type Storage, type StoredRecord } from './storage/types';

export type DataState = {
  ready: boolean;
  data: Snapshot;
  /** «Сегодня» — обновляется при смене суток, чтобы экраны перерисовались. */
  today: ISODate;
};

export const useDataStore = create<DataState>(() => ({
  ready: false,
  data: emptySnapshot(todayStr()),
  today: todayStr(),
}));

// ── Часы (подменяются в тестах) ──────────────────────────────────────────────

let clock: () => number = () => Date.now();
export function setClock(fn: () => number): void {
  clock = fn;
}
export function now(): number {
  return clock();
}

// ── Запись в хранилище ───────────────────────────────────────────────────────

let storage: Storage | null = null;
const pending = new Map<string, StoredRecord>();
let flushScheduled = false;
let flushing: Promise<void> = Promise.resolve();

function enqueue(records: StoredRecord[]): void {
  for (const r of records) pending.set(`${r.collection}/${r.record.id}`, r);
  if (!flushScheduled) {
    flushScheduled = true;
    setTimeout(() => {
      void flush();
    }, 0);
  }
}

/** Дописать всё, что ещё не записано. Безопасно вызывать сколько угодно раз. */
export function flush(): Promise<void> {
  flushScheduled = false;
  if (!storage || pending.size === 0) return flushing;
  const batch = [...pending.values()];
  pending.clear();
  const target = storage;
  flushing = flushing
    .then(() => target.write(batch))
    .catch((e) => {
      // Не теряем изменения: вернём их в очередь, следующая запись повторит попытку.
      console.error('Failed to persist changes', e);
      for (const r of batch) {
        const key = `${r.collection}/${r.record.id}`;
        if (!pending.has(key)) pending.set(key, r);
      }
    });
  return flushing;
}

// ── Загрузка ─────────────────────────────────────────────────────────────────

export type LegacySource = {
  /** Сырые данные старой версии приложения или null. Источник не изменяется. */
  read(): Promise<string | null>;
};

export type InitResult = { migrated: boolean; legacyError: string | null };

export async function initData(opts: {
  storage: Storage;
  legacy?: LegacySource;
}): Promise<InitResult> {
  storage = opts.storage;
  const today = todayStr();
  const t = now();
  let migrated = false;
  let legacyError: string | null = null;

  const records = await storage.loadAll();
  const profileRaw = await storage.getMeta(META.profile);
  let snap: Snapshot;

  if (records.length === 0 && profileRaw === null) {
    // Первый запуск новой версии. Если есть данные старой — переносим их.
    snap = emptySnapshot(today);
    const raw = opts.legacy ? await opts.legacy.read() : null;
    if (raw) {
      try {
        snap = fromLegacyV4(JSON.parse(raw), t, today);
        migrated = true;
      } catch (e) {
        // Старые данные не трогаем: они остаются на месте как резервная копия.
        legacyError = e instanceof Error ? e.message : String(e);
        console.warn('Legacy data could not be migrated, starting empty', e);
      }
      await storage.setMeta(
        META.legacyMigration,
        JSON.stringify({ from: 'CoolTick.v4', at: t, ok: migrated, error: legacyError })
      );
    }
    const all: StoredRecord[] = [];
    for (const collection of COLLECTIONS) {
      for (const record of Object.values(snap[collection])) all.push({ collection, record });
    }
    await storage.write(all);
    await storage.setMeta(META.profile, JSON.stringify(snap.profile));
  } else {
    snap = emptySnapshot(today);
    try {
      const p = profileRaw ? (JSON.parse(profileRaw) as Partial<Profile>) : {};
      if (typeof p.startedAt === 'string') snap.profile.startedAt = p.startedAt;
    } catch {
      /* профиль восстановим по умолчанию */
    }
    for (const { collection, record } of records) {
      (snap[collection] as Record<string, AnyRecord>)[record.id] = record;
    }
  }

  useDataStore.setState({ ready: true, data: snap, today });
  return { migrated, legacyError };
}

// ── Изменения ────────────────────────────────────────────────────────────────

/** Применить изменения: в память сразу, в хранилище — в конце тика. */
export function commit(records: StoredRecord[]): void {
  if (!records.length) return;
  useDataStore.setState((s) => {
    const data = { ...s.data };
    const touched = new Set<CollectionName>();
    for (const { collection, record } of records) {
      if (!touched.has(collection)) {
        (data as Record<string, unknown>)[collection] = { ...s.data[collection] };
        touched.add(collection);
      }
      (data[collection] as Record<string, AnyRecord>)[record.id] = record;
    }
    return { data };
  });
  enqueue(records);
}

type Fields<K extends CollectionName> = Omit<Collections[K], keyof RecordMeta>;

/** Время изменения строго больше прошлого — чтобы «последнее изменение» было однозначным. */
function stamp(prev: RecordMeta | undefined): number {
  const t = now();
  return prev && prev.updatedAt >= t ? prev.updatedAt + 1 : t;
}

export function get<K extends CollectionName>(
  collection: K,
  id: string
): Collections[K] | undefined {
  const r = useDataStore.getState().data[collection][id] as Collections[K] | undefined;
  return r && r.deletedAt === null ? r : undefined;
}

/** Новая запись (или воскрешение удалённой с тем же id). */
export function draftCreate<K extends CollectionName>(
  collection: K,
  id: string,
  fields: Fields<K>
): StoredRecord {
  const prev = useDataStore.getState().data[collection][id] as RecordMeta | undefined;
  const t = stamp(prev);
  const record = {
    ...fields,
    id,
    createdAt: prev && prev.deletedAt === null ? prev.createdAt : t,
    updatedAt: t,
    deletedAt: null,
  } as unknown as AnyRecord;
  return { collection, record };
}

export function draftPatch<K extends CollectionName>(
  collection: K,
  id: string,
  changes: Partial<Fields<K>>
): StoredRecord | null {
  const prev = get(collection, id);
  if (!prev) return null;
  const record = { ...prev, ...changes, updatedAt: stamp(prev) } as AnyRecord;
  return { collection, record };
}

export function draftDelete<K extends CollectionName>(
  collection: K,
  id: string
): StoredRecord | null {
  const prev = get(collection, id);
  if (!prev) return null;
  const t = stamp(prev);
  return { collection, record: { ...prev, updatedAt: t, deletedAt: t } as AnyRecord };
}

/** Вернуть мягко удалённую запись как была (для «Отменить»). */
export function draftRestore<K extends CollectionName>(
  collection: K,
  id: string
): StoredRecord | null {
  const prev = useDataStore.getState().data[collection][id] as RecordMeta | undefined;
  if (!prev || prev.deletedAt === null) return null;
  return {
    collection,
    record: { ...prev, updatedAt: stamp(prev), deletedAt: null } as AnyRecord,
  };
}

export function compact(drafts: (StoredRecord | null)[]): StoredRecord[] {
  return drafts.filter((d): d is StoredRecord => d !== null);
}

/**
 * Заменить все данные снимком (импорт бэкапа). Текущие записи мягко удаляются,
 * импортированные получают свежий `updatedAt` — при синхронизации победят именно они.
 */
export async function replaceAll(snap: Snapshot): Promise<void> {
  const state = useDataStore.getState().data;
  const drafts: StoredRecord[] = [];
  const incoming = new Set<string>();
  for (const collection of COLLECTIONS) {
    for (const r of Object.values(snap[collection])) {
      if (r.deletedAt !== null) continue;
      incoming.add(`${collection}/${r.id}`);
      const prev = state[collection][r.id] as RecordMeta | undefined;
      drafts.push({ collection, record: { ...r, updatedAt: stamp(prev), deletedAt: null } });
    }
    for (const r of Object.values(state[collection]) as RecordMeta[]) {
      if (r.deletedAt === null && !incoming.has(`${collection}/${r.id}`)) {
        const t = stamp(r);
        drafts.push({ collection, record: { ...r, updatedAt: t, deletedAt: t } as AnyRecord });
      }
    }
  }
  commit(drafts);
  useDataStore.setState((s) => ({ data: { ...s.data, profile: { ...snap.profile } } }));
  if (storage) await storage.setMeta(META.profile, JSON.stringify(snap.profile));
  await flush();
}

export function setToday(today: ISODate): void {
  if (useDataStore.getState().today !== today) useDataStore.setState({ today });
}

/** Только для тестов: сбросить стор и очередь записи. */
export function resetForTests(): void {
  storage = null;
  pending.clear();
  flushScheduled = false;
  flushing = Promise.resolve();
  useDataStore.setState({ ready: false, data: emptySnapshot(todayStr()), today: todayStr() });
}
