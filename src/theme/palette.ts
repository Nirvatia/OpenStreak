/**
 * Палитра «Штампа»: тема (светлая / тёмная) + выбранные чернила.
 * Цвета берутся только из `palettes.json` — там же список пар для проверки контраста.
 * Сборка палитры повторена в `scripts/check-contrast.mjs`; меняя её здесь, поменяйте и там.
 */
import palettes from './palettes.json';

export type Scheme = 'light' | 'dark';
/** Что выбрал пользователь: конкретная тема или «как в системе». */
export type ThemeMode = Scheme | 'system';
/** Цвет чернил: красные, синие или «одноцветные» (чёрные в светлой теме, белые в тёмной). */
export type InkName = 'red' | 'blue' | 'mono';

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];
export const INK_NAMES: readonly InkName[] = ['red', 'blue', 'mono'];
export const DEFAULT_INK: InkName = 'red';

export type Palette = {
  /** фон экрана — бетон */
  bg: string;
  /** «документ»: карточки, поля ввода, шторки */
  paper: string;
  /** основной текст, рамки, тёмные кнопки */
  ink: string;
  /** второй текст, метки */
  pencil: string;
  /** мелкий красный: просрочено, срыв */
  debt: string;
  /** отдых, выходной */
  rest: string;
  /** печати и акценты — цвет выбранных чернил */
  stamp: string;
  /** таб-бар */
  nav: string;
  navText: string;
  navMuted: string;
  /** отметка активной вкладки */
  navMark: string;
  /** текст на `ink` (инверсия) */
  onInk: string;
  onInkMuted: string;
  /** текст на `stamp` */
  onStamp: string;
};

type InkOverride = Partial<Palette> & { stamp: string };

const themes = palettes.themes as Record<Scheme, Omit<Palette, 'stamp' | 'navMark'>>;
const inks = palettes.inks as Record<InkName, Record<Scheme, InkOverride>>;

export function resolvePalette(scheme: Scheme, ink: InkName): Palette {
  const over = inks[ink][scheme];
  return { ...themes[scheme], navMark: over.stamp, ...over };
}

/** Тема, которая реально показывается. `system` — null, если система не сообщила свою. */
export function resolveScheme(mode: ThemeMode, system: Scheme | null | undefined): Scheme {
  if (mode === 'system') return system ?? 'light';
  return mode;
}

export function isThemeMode(v: unknown): v is ThemeMode {
  return typeof v === 'string' && (THEME_MODES as readonly string[]).includes(v);
}

export function isInkName(v: unknown): v is InkName {
  return typeof v === 'string' && (INK_NAMES as readonly string[]).includes(v);
}
