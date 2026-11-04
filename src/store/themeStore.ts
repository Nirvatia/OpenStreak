import { Appearance } from 'react-native';
import { create } from 'zustand';
import { INK_KEY, storage, THEME_KEY } from '../services/storage';
import {
  DEFAULT_INK,
  isInkName,
  isThemeMode,
  resolvePalette,
  resolveScheme,
  type InkName,
  type Palette,
  type Scheme,
  type ThemeMode,
} from '../theme/palette';
import { lightTheme, darkTheme, Theme } from '../theme/tokens';

type ThemeStore = {
  /** выбор пользователя */
  mode: ThemeMode;
  ink: InkName;
  /** что сообщает система (для режима «как в системе») */
  system: Scheme | null;
  /** тема, которая реально показывается */
  scheme: Scheme;
  /** палитра «Штампа» для новых компонентов */
  palette: Palette;

  /** @deprecated старые экраны: то же, что `scheme` */
  theme: Scheme;
  /** @deprecated старые экраны: токены из `theme/tokens.ts` */
  currentTheme: Theme;

  setMode: (mode: ThemeMode) => Promise<void>;
  setInk: (ink: InkName) => Promise<void>;
  /** @deprecated старые экраны: явная тема */
  setTheme: (theme: Scheme) => Promise<void>;
  /** @deprecated старые экраны: переключить на противоположную показываемой */
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
};

function systemScheme(): Scheme | null {
  const s = Appearance.getColorScheme();
  return s === 'dark' || s === 'light' ? s : null;
}

function derive(mode: ThemeMode, ink: InkName, system: Scheme | null) {
  const scheme = resolveScheme(mode, system);
  return {
    mode,
    ink,
    system,
    scheme,
    palette: resolvePalette(scheme, ink),
    theme: scheme,
    currentTheme: scheme === 'dark' ? darkTheme : lightTheme,
  };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...derive('system', DEFAULT_INK, systemScheme()),

  setMode: async (mode) => {
    const { ink, system } = get();
    set(derive(mode, ink, system));
    await storage.setString(THEME_KEY, mode);
  },

  setInk: async (ink) => {
    const { mode, system } = get();
    set(derive(mode, ink, system));
    await storage.setString(INK_KEY, ink);
  },

  setTheme: (theme) => get().setMode(theme),

  toggleTheme: () => get().setMode(get().scheme === 'dark' ? 'light' : 'dark'),

  loadTheme: async () => {
    const [savedMode, savedInk] = await Promise.all([
      storage.getString(THEME_KEY),
      storage.getString(INK_KEY),
    ]);
    const { mode, ink, system } = get();
    set(
      derive(
        isThemeMode(savedMode) ? savedMode : mode,
        isInkName(savedInk) ? savedInk : ink,
        system
      )
    );
  },
}));

// Смена темы в системе — пересчитать показываемую (важно для режима «как в системе»).
Appearance.addChangeListener(({ colorScheme }) => {
  const system = colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : null;
  const { mode, ink } = useThemeStore.getState();
  useThemeStore.setState(derive(mode, ink, system));
});

/** Палитра «Штампа» текущей темы и чернил. */
export const usePalette = (): Palette => useThemeStore((s) => s.palette);
