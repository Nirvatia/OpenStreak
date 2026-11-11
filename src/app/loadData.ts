/**
 * Загрузка данных с диска — одна на процесс. Нужна и запуску приложения, и фоновой задаче
 * геозон: когда система будит приложение у закрытого экрана, интерфейса нет, а данные нужны.
 */
import { createPlatformStorage } from '../core/storage';
import { initData, useDataStore } from '../core/store';
import { storage as kv, STATE_KEY } from '../services/storage';

let loading: Promise<void> | null = null;

export function loadData(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      try {
        const res = await initData({
          storage: createPlatformStorage(),
          // Ключ старой версии только читаем: он остаётся как резервная копия.
          legacy: { read: async () => (await kv.getString(STATE_KEY)) ?? null },
        });
        if (res.legacyError) console.warn('Old data was not migrated:', res.legacyError);
      } catch (e) {
        console.error('Failed to load data', e);
        // Пустой стор лучше вечной заставки; данные на диске не тронуты.
        useDataStore.setState({ ready: true });
      }
    })();
  }
  return loading;
}
