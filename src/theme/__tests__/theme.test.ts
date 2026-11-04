import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import palettes from '../palettes.json';
import {
  INK_NAMES,
  isInkName,
  isThemeMode,
  resolvePalette,
  resolveScheme,
  type Scheme,
} from '../palette';
import { STAMP_TILT, stampTilt } from '../stamp';

const mockStore = new Map<string, string>();
jest.mock('../../services/storage', () => ({
  THEME_KEY: 'theme',
  INK_KEY: 'ink',
  storage: {
    getString: async (k: string) => mockStore.get(k),
    setString: async (k: string, v: string) => void mockStore.set(k, v),
  },
}));

const SCHEMES: Scheme[] = ['light', 'dark'];

describe('palette', () => {
  test('every theme × ink has every colour, all hex', () => {
    for (const scheme of SCHEMES) {
      for (const ink of INK_NAMES) {
        const p = resolvePalette(scheme, ink);
        for (const [key, value] of Object.entries(p)) {
          expect([key, value]).toEqual([key, expect.stringMatching(/^#[0-9A-F]{6}$/)]);
        }
      }
    }
  });

  test('stamp comes from the ink, navMark falls back to stamp', () => {
    expect(resolvePalette('light', 'red').stamp).toBe(palettes.inks.red.light.stamp);
    expect(resolvePalette('light', 'red').navMark).toBe(palettes.inks.red.light.stamp);
    expect(resolvePalette('dark', 'blue').navMark).toBe(palettes.inks.blue.dark.stamp);
    // Синие и чёрные чернила не видны на чёрном таб-баре — там своя отметка.
    expect(resolvePalette('light', 'mono').navMark).toBe(palettes.inks.mono.light.navMark);
  });

  test('base colours do not depend on the ink', () => {
    expect(resolvePalette('dark', 'red').bg).toBe(resolvePalette('dark', 'mono').bg);
    expect(resolvePalette('light', 'blue').ink).toBe(palettes.themes.light.ink);
  });

  test('scheme: explicit mode wins, system falls back to light', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', null)).toBe('light');
  });

  test('guards reject unknown values', () => {
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('night')).toBe(false);
    expect(isInkName('blue')).toBe(true);
    expect(isInkName('black')).toBe(false);
    expect(isInkName(undefined)).toBe(false);
  });
});

describe('stampTilt', () => {
  test('stays in range and is stable per key', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const t = stampTilt(`task-${i}`);
      expect(t).toBeGreaterThanOrEqual(STAMP_TILT.min);
      expect(t).toBeLessThanOrEqual(STAMP_TILT.max);
      expect(stampTilt(`task-${i}`)).toBe(t);
      seen.add(t);
    }
    expect(seen.size).toBeGreaterThan(10);
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

  test('defaults: follow the system, red ink', async () => {
    const s = (await load()).getState();
    expect(s.mode).toBe('system');
    expect(s.ink).toBe('red');
  });

  test('old saved light/dark value still works', async () => {
    mockStore.set('theme', 'dark');
    const s = (await load()).getState();
    expect(s.mode).toBe('dark');
    expect(s.scheme).toBe('dark');
    expect(s.currentTheme.isDark).toBe(true);
    expect(s.palette.bg).toBe(palettes.themes.dark.bg);
  });

  test('garbage in storage is ignored', async () => {
    mockStore.set('theme', 'night');
    mockStore.set('ink', 'green');
    const s = (await load()).getState();
    expect(s.mode).toBe('system');
    expect(s.ink).toBe('red');
  });

  test('setInk and setMode persist and recompute the palette', async () => {
    const st = await load();
    await st.getState().setMode('light');
    await st.getState().setInk('blue');
    expect(mockStore.get('theme')).toBe('light');
    expect(mockStore.get('ink')).toBe('blue');
    expect(st.getState().palette.stamp).toBe(palettes.inks.blue.light.stamp);
    await st.getState().toggleTheme();
    expect(st.getState().scheme).toBe('dark');
    expect(st.getState().palette.stamp).toBe(palettes.inks.blue.dark.stamp);
  });
});
