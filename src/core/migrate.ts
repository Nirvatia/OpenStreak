/**
 * Приведение внешних данных к модели v2.
 *
 * - `fromLegacyV4` — старое состояние приложения (ключ `CoolTick.v4` и экспорт «CoolTick» версии 4);
 * - `fromExportV5` — новый формат экспорта;
 * - `parseBackup` — определяет формат сам.
 *
 * Всё, что приходит снаружи, считается недоверенным: неверные записи отбрасываются,
 * пропущенные поля получают значения по умолчанию.
 */
import { newId } from './ids';
import { DEFAULT_SETTINGS } from './settings';
import {
  COLLECTIONS,
  SETTINGS_ID,
  checkId,
  emptySnapshot,
  type Area,
  type DayReview,
  type Goal,
  type Habit,
  type HabitCheck,
  type ISODate,
  type Place,
  type Priority,
  type RecordMeta,
  type RestPeriod,
  type Settings,
  type Snapshot,
  type Task,
} from './model';

export const EXPORT_APP = 'OpenStreak';
export const EXPORT_FORMAT = 5;

type Raw = Record<string, unknown>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_COLOR = '#2f7cf6';

function isObj(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function str(v: unknown, def = ''): string {
  return typeof v === 'string' ? v : def;
}
function nonEmpty(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}
function date(v: unknown): ISODate | null {
  return typeof v === 'string' && DATE_RE.test(v) ? v : null;
}
function time(v: unknown): string {
  return typeof v === 'string' && TIME_RE.test(v) ? v : '';
}
function color(v: unknown): string {
  return typeof v === 'string' && COLOR_RE.test(v) ? v : DEFAULT_COLOR;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function ts(v: unknown, def: number): number {
  const n = num(v);
  return n !== null && n > 0 ? n : def;
}
function idOrNull(v: unknown): string | null {
  return typeof v === 'string' && v ? v : null;
}

function meta(x: Raw, now: number): RecordMeta | null {
  const id = idOrNull(x.id);
  if (!id) return null;
  const createdAt = ts(x.createdAt, now);
  return {
    id,
    createdAt,
    updatedAt: ts(x.updatedAt, now),
    deletedAt: num(x.deletedAt),
  };
}

// ── Очистка записей v2 ────────────────────────────────────────────────────────

export function cleanTask(x: unknown, now: number): Task | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const title = nonEmpty(x.title);
  if (!m || !title) return null;
  const p = num(x.priority);
  return {
    ...m,
    title,
    notes: str(x.notes),
    date: date(x.date),
    priority: (p !== null && p >= 0 && p <= 3 ? Math.round(p) : 0) as Priority,
    doneOn: date(x.doneOn),
    doneAt: date(x.doneOn) ? num(x.doneAt) : null,
    areaId: idOrNull(x.areaId),
    remindAt: time(x.remindAt),
    placeId: idOrNull(x.placeId),
    placeTrigger: x.placeTrigger === 'enter' || x.placeTrigger === 'exit' ? x.placeTrigger : null,
  };
}

export function cleanHabit(x: unknown, now: number, startedAt: ISODate): Habit | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const name = nonEmpty(x.name);
  if (!m || !name) return null;
  const measure = x.measure === 'numeric' ? 'numeric' : 'boolean';
  const target = num(x.target);
  const days = Array.isArray(x.days)
    ? [
        ...new Set(x.days.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6)),
      ].sort()
    : null;
  return {
    ...m,
    name,
    kind: x.kind === 'bad' ? 'bad' : 'good',
    icon: nonEmpty(x.icon) ?? 'target',
    color: color(x.color),
    days: days && days.length ? days : null,
    question: str(x.question),
    remindAt: time(x.remindAt),
    areaId: idOrNull(x.areaId),
    startDate: date(x.startDate) ?? startedAt,
    measure,
    unit: x.unit === 'minutes' || x.unit === 'hours' ? x.unit : 'count',
    target: measure === 'numeric' && target !== null && target > 0 ? target : 1,
    placeId: idOrNull(x.placeId),
    placeTrigger: x.placeTrigger === 'enter' || x.placeTrigger === 'exit' ? x.placeTrigger : null,
    archivedAt: num(x.archivedAt),
  };
}

export function cleanCheck(x: unknown, now: number): HabitCheck | null {
  if (!isObj(x)) return null;
  const habitId = idOrNull(x.habitId);
  const d = date(x.date);
  const value = num(x.value);
  const slip = x.slip === true;
  if (!habitId || !d || value === null || value < 0 || (value === 0 && !slip)) return null;
  const m = meta({ ...x, id: checkId(habitId, d) }, now)!;
  return slip ? { ...m, habitId, date: d, value: 0, slip } : { ...m, habitId, date: d, value };
}

export function cleanRest(x: unknown, now: number): RestPeriod | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const habitId = idOrNull(x.habitId);
  const from = date(x.from);
  const to = date(x.to);
  if (!m || !habitId || !from || !to) return null;
  return { ...m, habitId, from: from <= to ? from : to, to: from <= to ? to : from };
}

export function cleanArea(x: unknown, now: number): Area | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const name = nonEmpty(x.name);
  if (!m || !name) return null;
  return { ...m, name, color: color(x.color), icon: nonEmpty(x.icon) ?? 'target' };
}

export function cleanGoal(x: unknown, now: number): Goal | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const text = nonEmpty(x.text);
  const areaId = idOrNull(x.areaId);
  if (!m || !text || !areaId) return null;
  return {
    ...m,
    areaId,
    text,
    criterion: str(x.criterion),
    reward: str(x.reward),
    penalty: str(x.penalty),
    deadline: date(x.deadline),
    doneOn: date(x.doneOn),
  };
}

export function cleanReview(x: unknown, now: number): DayReview | null {
  if (!isObj(x)) return null;
  const d = date(x.date);
  const mood = num(x.mood);
  if (!d || mood === null) return null;
  const m = meta({ ...x, id: d }, now)!;
  return { ...m, date: d, mood: Math.min(5, Math.max(1, Math.round(mood))), note: str(x.note) };
}

export function cleanPlace(x: unknown, now: number): Place | null {
  if (!isObj(x)) return null;
  const m = meta(x, now);
  const name = nonEmpty(x.name);
  const lat = num(x.latitude);
  const lng = num(x.longitude);
  const radius = num(x.radius);
  if (!m || !name || lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return null;
  return { ...m, name, latitude: lat, longitude: lng, radius: radius && radius > 0 ? radius : 150 };
}

export function cleanSettings(x: unknown, now: number): Settings | null {
  if (!isObj(x)) return null;
  const m = meta({ ...x, id: SETTINGS_ID }, now)!;
  const d = DEFAULT_SETTINGS;
  return {
    ...m,
    theme: x.theme === 'dark' || x.theme === 'light' || x.theme === 'system' ? x.theme : d.theme,
    tone: x.tone === 'plain' || x.tone === 'bro' ? x.tone : d.tone,
    quotes: typeof x.quotes === 'boolean' ? x.quotes : d.quotes,
    ranks: typeof x.ranks === 'boolean' ? x.ranks : d.ranks,
    locale: x.locale === 'ru' || x.locale === 'en' || x.locale === 'es' ? x.locale : d.locale,
    weekStart: x.weekStart === 0 ? 0 : x.weekStart === 1 ? 1 : d.weekStart,
    reviewAt: typeof x.reviewAt === 'string' ? time(x.reviewAt) : d.reviewAt,
  };
}

// ── Старый формат v4 ─────────────────────────────────────────────────────────

/**
 * Старое состояние → снимок v2. `raw` — объект состояния (`tasks`, `habits`, `areas`, `moods`, …)
 * или экспорт `{ app: 'CoolTick', version: 4, state }`.
 */
export function fromLegacyV4(raw: unknown, now: number, today: ISODate): Snapshot {
  const root = isObj(raw) && isObj(raw.state) ? raw.state : raw;
  if (!isObj(root) || !Array.isArray(root.tasks) || !Array.isArray(root.habits)) {
    throw new Error('Not an OpenStreak v4 state');
  }
  const startedAt = date(root.startedAt) ?? today;
  const snap = emptySnapshot(startedAt);

  for (const t of root.tasks) {
    if (!isObj(t)) continue;
    const doneOn = t.done ? (date(t.doneAt) ?? date(t.date) ?? today) : null;
    const task = cleanTask(
      {
        ...t,
        doneOn,
        doneAt: null,
        areaId: t.area,
        remindAt: t.remind,
        createdAt: t.createdAt,
        updatedAt: now,
      },
      now
    );
    if (task) snap.tasks[task.id] = task;
  }

  for (const h of root.habits) {
    if (!isObj(h)) continue;
    const habit = cleanHabit(
      {
        ...h,
        kind: h.type,
        icon: h.emoji,
        areaId: h.area,
        remindAt: h.remind,
        startDate: h.createdAt,
        measure: h.measureType,
        createdAt: now,
        updatedAt: now,
      },
      now,
      startedAt
    );
    if (!habit) continue;
    snap.habits[habit.id] = habit;

    // dates + progress → отметки. Для numeric значение берём из progress, если оно есть.
    const progress = isObj(h.progress) ? h.progress : {};
    const values = new Map<string, number>();
    if (Array.isArray(h.dates)) {
      for (const d of h.dates) {
        if (date(d)) values.set(d as string, habit.measure === 'numeric' ? habit.target : 1);
      }
    }
    if (habit.measure === 'numeric') {
      for (const [d, v] of Object.entries(progress)) {
        const n = num(v);
        if (date(d) && n !== null && n > 0) values.set(d, n);
      }
    }
    for (const [d, value] of values) {
      const check = cleanCheck({ habitId: habit.id, date: d, value, updatedAt: now }, now);
      if (check) snap.checks[check.id] = check;
    }

    if (Array.isArray(h.rest)) {
      for (const r of h.rest) {
        if (!isObj(r)) continue;
        const rest = cleanRest({ id: newId(), habitId: habit.id, from: r.f, to: r.t }, now);
        if (rest) snap.rests[rest.id] = rest;
      }
    }
  }

  if (Array.isArray(root.areas)) {
    for (const a of root.areas) {
      const area = cleanArea(a, now);
      if (!area || !isObj(a)) continue;
      snap.areas[area.id] = area;
      if (!Array.isArray(a.goals)) continue;
      for (const g of a.goals) {
        if (!isObj(g)) continue;
        const goal = cleanGoal(
          {
            ...g,
            areaId: area.id,
            criterion: g.crit,
            reward: g.rew,
            penalty: g.pen,
            deadline: g.dead,
            doneOn: g.done ? (date(g.doneAt) ?? today) : null,
          },
          now
        );
        if (goal) snap.goals[goal.id] = goal;
      }
    }
  }

  if (isObj(root.moods)) {
    for (const [d, m] of Object.entries(root.moods)) {
      if (!isObj(m)) continue;
      const review = cleanReview({ date: d, mood: m.mood, note: m.note }, now);
      if (review) snap.reviews[review.id] = review;
    }
  }

  return snap;
}

// ── Формат экспорта v5 ───────────────────────────────────────────────────────

export type ExportPayloadV5 = {
  app: typeof EXPORT_APP;
  format: typeof EXPORT_FORMAT;
  exportedAt: string;
  theme?: 'light' | 'dark';
  profile: Snapshot['profile'];
  data: { [K in keyof Omit<Snapshot, 'profile'>]: unknown[] };
};

export function toExportV5(snap: Snapshot, theme?: 'light' | 'dark'): ExportPayloadV5 {
  const data = {} as ExportPayloadV5['data'];
  for (const name of COLLECTIONS) {
    data[name] = Object.values(snap[name]).filter((r) => r.deletedAt === null);
  }
  return {
    app: EXPORT_APP,
    format: EXPORT_FORMAT,
    exportedAt: new Date().toISOString(),
    theme,
    profile: snap.profile,
    data,
  };
}

export function fromExportV5(raw: unknown, now: number, today: ISODate): Snapshot {
  if (!isObj(raw) || raw.format !== EXPORT_FORMAT || !isObj(raw.data)) {
    throw new Error('Not an OpenStreak v5 export');
  }
  const profile = isObj(raw.profile) ? raw.profile : {};
  const startedAt = date(profile.startedAt) ?? today;
  const snap = emptySnapshot(startedAt);
  const list = (k: string): unknown[] => {
    const v = (raw.data as Raw)[k];
    return Array.isArray(v) ? v : [];
  };
  const put = <T extends RecordMeta>(target: Record<string, T>, rec: T | null) => {
    if (rec) target[rec.id] = rec;
  };
  for (const x of list('tasks')) put(snap.tasks, cleanTask(x, now));
  for (const x of list('habits')) put(snap.habits, cleanHabit(x, now, startedAt));
  for (const x of list('checks')) put(snap.checks, cleanCheck(x, now));
  for (const x of list('rests')) put(snap.rests, cleanRest(x, now));
  for (const x of list('areas')) put(snap.areas, cleanArea(x, now));
  for (const x of list('goals')) put(snap.goals, cleanGoal(x, now));
  for (const x of list('reviews')) put(snap.reviews, cleanReview(x, now));
  for (const x of list('places')) put(snap.places, cleanPlace(x, now));
  for (const x of list('settings')) put(snap.settings, cleanSettings(x, now));
  return snap;
}

export type ParsedBackup = { snapshot: Snapshot; theme?: 'light' | 'dark'; format: 4 | 5 };

/** Разобрать текст бэкапа любого поддерживаемого формата. Бросает ошибку, если формат не узнан. */
export function parseBackup(text: string, now: number, today: ISODate): ParsedBackup {
  const raw: unknown = JSON.parse(text);
  const theme =
    isObj(raw) && (raw.theme === 'light' || raw.theme === 'dark') ? raw.theme : undefined;
  if (isObj(raw) && raw.format === EXPORT_FORMAT) {
    return { snapshot: fromExportV5(raw, now, today), theme, format: 5 };
  }
  return { snapshot: fromLegacyV4(raw, now, today), theme, format: 4 };
}
