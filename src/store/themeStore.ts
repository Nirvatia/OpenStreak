import { create } from 'zustand';
import { storage, THEME_KEY } from '../services/storage';
import { lightTheme, darkTheme, Theme } from '../theme/tokens';

type ThemeStore = {
  theme: 'light' | 'dark';
  currentTheme: Theme;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  currentTheme: lightTheme,

  setTheme: async (theme: 'light' | 'dark') => {
    await storage.setString(THEME_KEY, theme);
    set({ theme, currentTheme: theme === 'light' ? lightTheme : darkTheme });
  },

  toggleTheme: async () => {
    const current = get().theme;
    const newTheme = current === 'light' ? 'dark' : 'light';
    await get().setTheme(newTheme);
  },

  loadTheme: async () => {
    const savedTheme = await storage.getString(THEME_KEY);
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    set({ theme, currentTheme: theme === 'light' ? lightTheme : darkTheme });
  },
}));
