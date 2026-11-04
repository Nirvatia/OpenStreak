/**
 * Палитра «Мульта»: «День» (light) и «Вечерний мульт» (dark).
 * Цвета берутся только из `palettes.json` — там же список пар для проверки контраста.
 */
import palettes from './palettes.json';

export type Scheme = 'light' | 'dark';
/** Что выбрал пользователь: конкретная тема или «как в системе». */
export type ThemeMode = Scheme | 'system';

export const THEME_MODES: readonly ThemeMode[] = ['dark', 'light', 'system'];

export type Palette = {
  /** фон экрана */
  bg: string;
  /** наклейка: карточки, поля, шторка, таб-бар */
  surface: string;
  /** основной текст */
  text: string;
  /** подписи и второй текст */
  muted: string;
  /** обводка наклеек */
  line: string;
  /** жёсткая тень наклеек */
  shadow: string;
  /** луна и главное действие */
  sun: string;
  onSun: string;
  /** зачёт, «включено» */
  teal: string;
  onTeal: string;
  /** только слив и долги */
  red: string;
  onRed: string;
  /** плашки, пузырь цитаты, выбранная плитка */
  tag: string;
  /** плитки иконок привычек */
  sky: string;
  /** пунктир между строками в наклейке */
  divider: string;
  /** тёмная сторона луны, дорожки (прогресс, выключенный переключатель) */
  track: string;
  /** кольцо луны */
  ring: string;
  crater: string;
  craterRed: string;
  /** тост — инверсия к теме */
  toast: string;
  onToast: string;
  /** затемнение под шторкой (с прозрачностью из metrics) */
  scrim: string;
  knobOff: string;
  knobOn: string;
  /** рисунок волка и звёзды — декоративные, в проверку контраста не входят */
  fur: string;
  furShade: string;
  muzzle: string;
  ear: string;
  eye: string;
  tongue: string;
  drop: string;
  star: string;
};

const themes = palettes.themes as Record<Scheme, Palette>;

export function resolvePalette(scheme: Scheme): Palette {
  return themes[scheme];
}

/** Тема, которая реально показывается. `system` — null, если система не сообщила свою. */
export function resolveScheme(mode: ThemeMode, system: Scheme | null | undefined): Scheme {
  if (mode === 'system') return system ?? 'dark';
  return mode;
}

export function isThemeMode(v: unknown): v is ThemeMode {
  return typeof v === 'string' && (THEME_MODES as readonly string[]).includes(v);
}
