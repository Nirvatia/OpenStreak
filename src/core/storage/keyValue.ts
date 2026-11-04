import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLLECTIONS, type AnyRecord, type CollectionName } from '../model';
import type { Storage, StoredRecord } from './types';

const PREFIX = 'openstreak.v2';

/**
 * Хранилище поверх AsyncStorage (веб). Каждая коллекция — один JSON-объект `id → запись`.
 * Для веба этого достаточно: данных немного, а SQLite в браузере требует особых заголовков.
 */
export class KeyValueStorage implements Storage {
  private cache: Partial<Record<CollectionName, Record<string, AnyRecord>>> = {};

  private async collection(name: CollectionName): Promise<Record<string, AnyRecord>> {
    const cached = this.cache[name];
    if (cached) return cached;
    let map: Record<string, AnyRecord> = {};
    const raw = await AsyncStorage.getItem(`${PREFIX}.${name}`);
    if (raw) {
      try {
        map = JSON.parse(raw) as Record<string, AnyRecord>;
      } catch (e) {
        // Не затираем: сохраняем испорченную копию рядом и начинаем коллекцию заново.
        console.warn(`Unreadable collection ${name}, keeping a copy`, e);
        await AsyncStorage.setItem(`${PREFIX}.${name}.corrupt.${Date.now()}`, raw);
      }
    }
    this.cache[name] = map;
    return map;
  }

  async loadAll(): Promise<StoredRecord[]> {
    const out: StoredRecord[] = [];
    for (const name of COLLECTIONS) {
      const map = await this.collection(name);
      for (const record of Object.values(map)) out.push({ collection: name, record });
    }
    return out;
  }

  async write(records: StoredRecord[]): Promise<void> {
    const touched = new Set<CollectionName>();
    for (const { collection, record } of records) {
      (await this.collection(collection))[record.id] = record;
      touched.add(collection);
    }
    await AsyncStorage.multiSet(
      [...touched].map((name) => [`${PREFIX}.${name}`, JSON.stringify(this.cache[name])])
    );
  }

  async getMeta(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`${PREFIX}.meta.${key}`);
  }

  async setMeta(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`${PREFIX}.meta.${key}`, value);
  }
}
