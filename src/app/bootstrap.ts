/**
 * Запуск приложения: загрузка данных (с переносом из старой версии), сверка напоминаний,
 * геозоны, отслеживание смены суток и запись на диск при уходе в фон.
 */
import { AppState as RNAppState } from 'react-native';
import { planReminders } from '../core/reminders';
import { flush, setToday, useDataStore } from '../core/store';
import { syncGeofences } from '../services/geofence';
import { syncReminders } from '../services/notifications';
import { todayStr } from '../core/dates';
import { loadData } from './loadData';
import { followSettings, seedSettingsFromDevice } from './settingsSync';

const REMINDER_SYNC_DELAY_MS = 1500;
const DAY_CHECK_INTERVAL_MS = 60_000;

let started: Promise<void> | null = null;

export function bootstrap(): Promise<void> {
  if (!started) started = start();
  return started;
}

async function start(): Promise<void> {
  await loadData();

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
      void syncGeofences();
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
