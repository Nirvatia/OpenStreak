/**
 * Настройки из данных → сторы интерфейса (тема, тон). При первом запуске новой версии
 * переносит в настройки то, что было сохранено на устройстве.
 */
import { updateSettings } from '../core/actions';
import { SETTINGS_ID } from '../core/model';
import { settingsOf } from '../core/settings';
import { get, useDataStore } from '../core/store';
import { storage, THEME_KEY, TONE_KEY } from '../services/storage';
import { usePrefsStore } from '../store/prefsStore';
import { useThemeStore } from '../store/themeStore';
import { isThemeMode } from '../theme/palette';

export async function seedSettingsFromDevice(): Promise<void> {
  if (get('settings', SETTINGS_ID)) return;
  const [theme, tone] = await Promise.all([
    storage.getString(THEME_KEY),
    storage.getString(TONE_KEY),
  ]);
  const seed: Parameters<typeof updateSettings>[0] = {};
  if (isThemeMode(theme)) seed.theme = theme;
  if (tone === 'plain' || tone === 'bro') seed.tone = tone;
  if (Object.keys(seed).length) updateSettings(seed);
}

/** Применять настройки к интерфейсу сейчас и при каждом изменении (в том числе из синхронизации). */
export function followSettings(): void {
  let last = '';
  const apply = () => {
    const s = settingsOf(useDataStore.getState().data);
    const key = `${s.theme}|${s.tone}|${s.locale}`;
    if (key === last) return;
    last = key;
    useThemeStore.getState().applyMode(s.theme);
    usePrefsStore.getState().apply({ tone: s.tone, locale: s.locale });
  };
  apply();
  useDataStore.subscribe((st, prev) => {
    if (st.data.settings !== prev.data.settings) apply();
  });
}
