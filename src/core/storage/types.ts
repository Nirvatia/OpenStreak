import type { AnyRecord, CollectionName } from '../model';

export type StoredRecord = { collection: CollectionName; record: AnyRecord };

/**
 * Постоянное хранилище записей. Хранит каждую запись целиком (JSON) по ключу
 * (collection, id) и метаданные «ключ → строка». Удалений нет: удалённая запись —
 * это запись с `deletedAt`.
 */
export interface Storage {
  /** Все записи. Испорченные записи пропускаются, а не роняют загрузку. */
  loadAll(): Promise<StoredRecord[]>;
  /** Вставить или заменить записи одной транзакцией. */
  write(records: StoredRecord[]): Promise<void>;
  getMeta(key: string): Promise<string | null>;
  setMeta(key: string, value: string): Promise<void>;
}

export const META = {
  /** профиль: JSON `Profile` */
  profile: 'profile',
  /** откуда и когда перенесли старые данные */
  legacyMigration: 'legacy-migration',
} as const;
