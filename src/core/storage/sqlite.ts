import * as SQLite from 'expo-sqlite';
import { COLLECTIONS, type AnyRecord, type CollectionName } from '../model';
import type { Storage, StoredRecord } from './types';

const SCHEMA_VERSION = 1;

/** Хранилище на SQLite (iOS, Android). Одна таблица записей + таблица метаданных. */
export class SqliteStorage implements Storage {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  constructor(private readonly fileName = 'openstreak.db') {}

  private db(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) this.dbPromise = this.open();
    return this.dbPromise;
  }

  private async open(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(this.fileName);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const version = row?.user_version ?? 0;
    if (version < 1) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS records (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          deleted_at INTEGER,
          data TEXT NOT NULL,
          PRIMARY KEY (collection, id)
        );
        CREATE INDEX IF NOT EXISTS records_updated ON records (updated_at);
        CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      `);
    }
    // Будущие миграции схемы: if (version < 2) { ... }
    if (version !== SCHEMA_VERSION) await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    return db;
  }

  async loadAll(): Promise<StoredRecord[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<{ collection: string; id: string; data: string }>(
      'SELECT collection, id, data FROM records'
    );
    const out: StoredRecord[] = [];
    for (const row of rows) {
      if (!(COLLECTIONS as readonly string[]).includes(row.collection)) continue;
      try {
        out.push({
          collection: row.collection as CollectionName,
          record: JSON.parse(row.data) as AnyRecord,
        });
      } catch (e) {
        // Битая запись не должна стоить пользователю всех данных — пропускаем её.
        console.warn(`Skipping unreadable record ${row.collection}/${row.id}`, e);
      }
    }
    return out;
  }

  async write(records: StoredRecord[]): Promise<void> {
    if (!records.length) return;
    const db = await this.db();
    await db.withTransactionAsync(async () => {
      for (const { collection, record } of records) {
        await db.runAsync(
          'INSERT OR REPLACE INTO records (collection, id, updated_at, deleted_at, data) VALUES (?, ?, ?, ?, ?)',
          collection,
          record.id,
          record.updatedAt,
          record.deletedAt,
          JSON.stringify(record)
        );
      }
    });
  }

  async getMeta(key: string): Promise<string | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM meta WHERE key = ?',
      key
    );
    return row?.value ?? null;
  }

  async setMeta(key: string, value: string): Promise<void> {
    const db = await this.db();
    await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, value);
  }
}
