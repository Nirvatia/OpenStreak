/**
 * Запуск приложения: загрузка данных (с переносом из старой версии), сверка напоминаний,
 * отслеживание смены суток и запись на диск при уходе в фон.
 */
import { AppState as RNAppState } from 'react-native';
import { planReminders } from '../core/reminders';
import { createPlatformStorage } from '../core/storage';
import { flush, initData, setToday, useDataStore } from '../core/store';
import { syncReminders } from '../services/notifications';
import { storage as kv, STATE_KEY } from '../services/storage';
import { todayStr } from '../core/dates';
import { followSettings, seedSettingsFromDevice } from './settingsSync';

const REMINDER_SYNC_DELAY_MS = 1500;
const DAY_CHECK_INTERVAL_MS = 60_000;

let started: Promise<void> | null = null;

export function bootstrap(): Promise<void> {
  if (!started) started = start();
  return started;
}

async function start(): Promise<void> {
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

  try {
    await seedSettingsFromDevice();
  } catch (e) {
    console.warn('Device settings were not carried over', e);
  }
  followSettings();

  let timer: ReturnType<typeof setTimeout> | null = null;
  const scheduleSync = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void syncReminders(planReminders(useDataStore.getState().data, new Date()));
    }, REMINDER_SYNC_DELAY_MS);
  };
  useDataStore.subscribe((s, prev) => {
    if (s.data !== prev.data || s.today !== prev.today) scheduleSync();
  });
  scheduleSync();

  const checkDay = () => setToday(todayStr());
  setInterval(checkDay, DAY_CHECK_INTERVAL_MS);
  RNAppState.addEventListener('change', (state) => {
    if (state === 'active') {
      checkDay();
      scheduleSync();
    } else {
      void flush();
    }
  });
}
