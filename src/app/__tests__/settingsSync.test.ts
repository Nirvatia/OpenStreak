import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as A from '../../core/actions';
import { SETTINGS_ID } from '../../core/model';
import { MemoryStorage } from '../../core/storage/memory';
import { initData, resetForTests, useDataStore } from '../../core/store';
import { usePrefsStore } from '../../store/prefsStore';
import { useThemeStore } from '../../store/themeStore';
import { followSettings, seedSettingsFromDevice } from '../settingsSync';

const mockDevice = new Map<string, string>();
jest.mock('../../services/storage', () => ({
  THEME_KEY: 'theme',
  TONE_KEY: 'tone',
  storage: {
    getString: async (k: string) => mockDevice.get(k),
    setString: async (k: string, v: string) => void mockDevice.set(k, v),
  },
}));

describe('настройки из данных', () => {
  beforeEach(async () => {
    mockDevice.clear();
    resetForTests();
    await initData({ storage: new MemoryStorage() });
  });

  test('первый запуск переносит тему и тон с устройства в настройки', async () => {
    mockDevice.set('theme', 'light');
    mockDevice.set('tone', 'plain');
    await seedSettingsFromDevice();
    expect(useDataStore.getState().data.settings[SETTINGS_ID]).toMatchObject({
      theme: 'light',
      tone: 'plain',
    });
  });

  test('уже есть настройки — с устройства ничего не берём', async () => {
    A.updateSettings({ theme: 'system' });
    mockDevice.set('theme', 'light');
    await seedSettingsFromDevice();
    expect(useDataStore.getState().data.settings[SETTINGS_ID].theme).toBe('system');
  });

  test('изменение настроек (в том числе пришедшее извне) сразу меняет тему и тон', () => {
    followSettings();
    A.updateSettings({ theme: 'light', tone: 'plain' });
    expect(useThemeStore.getState().scheme).toBe('light');
    expect(usePrefsStore.getState().tone).toBe('plain');
    useThemeStore.getState().setMode('dark');
    expect(useDataStore.getState().data.settings[SETTINGS_ID].theme).toBe('dark');
  });
});
