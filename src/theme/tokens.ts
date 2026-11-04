export type ThemeColors = {
  bg: string;
  card: string;
  card2: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  red: string;
  orange: string;
  blue: string;
  green: string;
  pink: string;
  navBg: string;
};

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
};

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    bg: '#f4f6fa',
    card: '#ffffff',
    card2: '#eef1f7',
    line: '#e5eaf2',
    text: '#141a23',
    muted: '#7c8698',
    accent: '#2f7cf6',
    accent2: '#1d63dd',
    accentSoft: 'rgba(47, 124, 246, 0.12)',
    red: '#ef4444',
    orange: '#f59e0b',
    blue: '#3b82f6',
    green: '#1fb876',
    pink: '#ec4899',
    navBg: 'rgba(255, 255, 255, 0.94)',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    bg: '#0e1217',
    card: '#161c24',
    card2: '#1e2631',
    line: '#26303c',
    text: '#edf1f7',
    muted: '#8b97a9',
    accent: '#2f7cf6',
    accent2: '#1d63dd',
    accentSoft: 'rgba(47, 124, 246, 0.18)',
    red: '#ef4444',
    orange: '#f59e0b',
    blue: '#3b82f6',
    green: '#1fb876',
    pink: '#ec4899',
    navBg: 'rgba(16, 21, 27, 0.94)',
  },
};
