/**
 * Палитра «Луны»: «Ночь» (dark, основная) и «Рассвет» (light).
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
  /** карточки, поля, шторка, таб-бар */
  surface: string;
  /** выбранный сегмент, пустая луна, дорожка выключенного переключателя */
  raised: string;
  /** разделители и рамки */
  line: string;
  /** основной текст и «лунный свет»: полная луна, главная кнопка (инверсия) */
  text: string;
  /** тёмная грань гранёной иконки цвета text */
  textShade: string;
  /** второй текст, подписи */
  muted: string;
  mutedShade: string;
  /** единственный смысловой цвет: слив, долг, просрочено */
  blood: string;
  bloodShade: string;
  /** текст и значки поверх `text` (инверсия) */
  onText: string;
  /** затемнение под шторкой (с прозрачностью из metrics) */
  scrim: string;
  /** волк-силуэт на полной луне */
  silhouette: string;
  silhouetteShade: string;
  silhouetteFeature: string;
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
