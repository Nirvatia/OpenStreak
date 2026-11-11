import { Appearance } from 'react-native';
import { create } from 'zustand';
import { updateSettings } from '../core/actions';
import { useDataStore } from '../core/store';
import { storage, THEME_KEY } from '../services/storage';
import { setCurrentDesign } from '../theme/design';
import {
  isThemeMode,
  type Design,
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
  /** оформление: «Обычный» или «АУФ» */
  design: Design;
  /** палитра текущего оформления и темы */
  palette: Palette;

  setMode: (mode: ThemeMode) => Promise<void>;
  applyMode: (mode: ThemeMode) => void;
  /** Применить оформление из настроек (без записи обратно). */
  applyDesign: (design: Design) => void;
  loadTheme: () => Promise<void>;
};

function systemScheme(): Scheme | null {
  const s = Appearance.getColorScheme();
  return s === 'dark' || s === 'light' ? s : null;
}

function derive(mode: ThemeMode, system: Scheme | null, design: Design) {
  const scheme = resolveScheme(mode, system);
  return {
    mode,
    system,
    scheme,
    design,
    palette: resolvePalette(scheme, design),
  };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...derive('system', systemScheme(), 'plain'),

  setMode: async (mode) => {
    set(derive(mode, get().system, get().design));
    // Источник правды — настройки в данных (синхронизируются); на устройстве — копия,
    // чтобы заставка до загрузки данных была в нужной теме.
    if (useDataStore.getState().ready) updateSettings({ theme: mode });
    await storage.setString(THEME_KEY, mode);
  },

  /** Применить тему из настроек (без записи обратно). */
  applyMode: (mode: ThemeMode) => {
    if (mode !== get().mode) set(derive(mode, get().system, get().design));
    void storage.setString(THEME_KEY, mode);
  },

  applyDesign: (design) => {
    if (design === get().design) return;
    setCurrentDesign(design);
    set(derive(get().mode, get().system, design));
  },

  loadTheme: async () => {
    const saved = await storage.getString(THEME_KEY);
    const { mode, system } = get();
    set(derive(isThemeMode(saved) ? saved : mode, system, get().design));
  },
}));

// Смена темы в системе — пересчитать показываемую (важно для режима «как в системе»).
Appearance.addChangeListener(({ colorScheme }) => {
  const system = colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : null;
  useThemeStore.setState(
    derive(useThemeStore.getState().mode, system, useThemeStore.getState().design)
  );
});

/** Палитра «Мульта» текущей темы. */
export const usePalette = (): Palette => useThemeStore((s) => s.palette);

/** «Обычное» оформление включено? */
export const usePlain = (): boolean => useThemeStore((s) => s.design === 'plain');
