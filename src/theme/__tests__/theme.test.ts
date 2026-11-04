import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import palettes from '../palettes.json';
import { isThemeMode, resolvePalette, resolveScheme, type Scheme } from '../palette';

const mockStore = new Map<string, string>();
jest.mock('../../services/storage', () => ({
  THEME_KEY: 'theme',
  storage: {
    getString: async (k: string) => mockStore.get(k),
    setString: async (k: string, v: string) => void mockStore.set(k, v),
  },
}));

const SCHEMES: Scheme[] = ['dark', 'light'];

describe('palette', () => {
  test('both themes have the same keys, all hex', () => {
    const keys = Object.keys(resolvePalette('dark')).sort();
    expect(Object.keys(resolvePalette('light')).sort()).toEqual(keys);
    for (const scheme of SCHEMES) {
      for (const [key, value] of Object.entries(resolvePalette(scheme))) {
        expect([key, value]).toEqual([key, expect.stringMatching(/^#[0-9A-F]{6}$/)]);
      }
    }
  });

  test('every checked colour exists in both themes', () => {
    for (const [fg, bg] of palettes.checks) {
      for (const scheme of SCHEMES) {
        expect(resolvePalette(scheme)).toHaveProperty(fg);
        expect(resolvePalette(scheme)).toHaveProperty(bg);
      }
    }
  });

  test('scheme: explicit mode wins, system falls back to night', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('dark');
  });

  test('guard rejects unknown values', () => {
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('night')).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
  });
});

describe('themeStore', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.resetModules();
  });

  const load = async () => {
    // Свежий модуль на каждый тест: стор создаётся при импорте.
    const { useThemeStore } =
      jest.requireActual<typeof import('../../store/themeStore')>('../../store/themeStore');
    await useThemeStore.getState().loadTheme();
    return useThemeStore;
  };

  test('default follows the system', async () => {
    expect((await load()).getState().mode).toBe('system');
  });

  test('old saved light/dark value still works', async () => {
    mockStore.set('theme', 'light');
    const s = (await load()).getState();
    expect(s.scheme).toBe('light');
    expect(s.palette.bg).toBe(palettes.themes.light.bg);
  });

  test('garbage in storage is ignored', async () => {
    mockStore.set('theme', 'night');
    expect((await load()).getState().mode).toBe('system');
  });

  test('setMode persists and recomputes the palette', async () => {
    const st = await load();
    await st.getState().setMode('dark');
    expect(mockStore.get('theme')).toBe('dark');
    expect(st.getState().palette.text).toBe(palettes.themes.dark.text);
    await st.getState().setMode('light');
    expect(st.getState().scheme).toBe('light');
    expect(st.getState().palette.bg).toBe(palettes.themes.light.bg);
  });
});
