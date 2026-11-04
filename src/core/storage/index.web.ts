import type { Storage } from './types';
import { KeyValueStorage } from './keyValue';

/** Хранилище платформы: в браузере — AsyncStorage (localStorage). */
export function createPlatformStorage(): Storage {
  return new KeyValueStorage();
}

export type { Storage, StoredRecord } from './types';
export { META } from './types';
