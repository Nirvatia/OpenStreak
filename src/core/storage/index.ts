import type { Storage } from './types';
import { SqliteStorage } from './sqlite';

/** Хранилище платформы: SQLite на iOS и Android. Для веба см. index.web.ts. */
export function createPlatformStorage(): Storage {
  return new SqliteStorage();
}

export type { Storage, StoredRecord } from './types';
export { META } from './types';
