import type { Storage, StoredRecord } from './types';

/** Хранилище в памяти — для тестов. Копирует данные, как настоящее хранилище. */
export class MemoryStorage implements Storage {
  private records = new Map<string, string>();
  private meta = new Map<string, string>();
  writes = 0;

  async loadAll(): Promise<StoredRecord[]> {
    return [...this.records.values()].map((s) => JSON.parse(s) as StoredRecord);
  }

  async write(records: StoredRecord[]): Promise<void> {
    this.writes++;
    for (const r of records) {
      this.records.set(`${r.collection}/${r.record.id}`, JSON.stringify(r));
    }
  }

  async getMeta(key: string): Promise<string | null> {
    return this.meta.get(key) ?? null;
  }

  async setMeta(key: string, value: string): Promise<void> {
    this.meta.set(key, value);
  }
}
