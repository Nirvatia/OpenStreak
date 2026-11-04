import { Appearance } from 'react-native';
import { create } from 'zustand';
import { updateSettings } from '../core/actions';
import { useDataStore } from '../core/store';
import { storage, THEME_KEY } from '../services/storage';
import {
  isThemeMode,
  resolvePalette,
  resolveScheme,
  type Palette,
  type Scheme,
  type ThemeMode,
} from '../theme/palette';

type ThemeStore = {
  /** выбор пользователя: «Ночь», «Рассвет» или как в системе */
  mode: ThemeMode;
  /** что сообщает система (для режима «как в системе») */
  system: Scheme | null;
  /** тема, которая реально показывается */
  scheme: Scheme;
  /** палитра «Мульта» */
  palette: Palette;

  setMode: (mode: ThemeMode) => Promise<void>;
  applyMode: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
};

function systemScheme(): Scheme | null {
  const s = Appearance.getColorScheme();
  return s === 'dark' || s === 'light' ? s : null;
}

function derive(mode: ThemeMode, system: Scheme | null) {
  const scheme = resolveScheme(mode, system);
  return {
    mode,
    system,
    scheme,
    palette: resolvePalette(scheme),
  };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...derive('system', systemScheme()),

  setMode: async (mode) => {
    set(derive(mode, get().system));
    // Источник правды — настройки в данных (синхронизируются); на устройстве — копия,
    // чтобы заставка до загрузки данных была в нужной теме.
    if (useDataStore.getState().ready) updateSettings({ theme: mode });
    await storage.setString(THEME_KEY, mode);
  },

  /** Применить тему из настроек (без записи обратно). */
  applyMode: (mode: ThemeMode) => {
    if (mode !== get().mode) set(derive(mode, get().system));
    void storage.setString(THEME_KEY, mode);
  },

  loadTheme: async () => {
    const saved = await storage.getString(THEME_KEY);
    const { mode, system } = get();
    set(derive(isThemeMode(saved) ? saved : mode, system));
  },
}));

// Смена темы в системе — пересчитать показываемую (важно для режима «как в системе»).
Appearance.addChangeListener(({ colorScheme }) => {
  const system = colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : null;
  useThemeStore.setState(derive(useThemeStore.getState().mode, system));
});

/** Палитра «Мульта» текущей темы. */
export const usePalette = (): Palette => useThemeStore((s) => s.palette);
