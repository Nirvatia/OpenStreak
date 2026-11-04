/**
 * Шкала текста «Штампа» по макету (`design/stamp/B-Kit.dc.html`).
 * Oswald 600/700 — заголовки капсом, числа, печати, кнопки; Golos Text — остальной текст.
 * Разрядка в макете задана в em, здесь — в пикселях (em × размер).
 * Цвет не задаётся: его берут из палитры (`ink`, `pencil`, …).
 */
import type { TextStyle } from 'react-native';
import { FONT } from './fonts';

const em = (size: number, value: number) => Math.round(size * value * 10) / 10;

type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'textTransform'
>;

function oswald(size: number, lh: number, spacing = 0, bold = true): Variant {
  return {
    fontFamily: bold ? FONT.oswald.bold : FONT.oswald.semibold,
    fontSize: size,
    lineHeight: Math.round(size * lh),
    letterSpacing: em(size, spacing),
    textTransform: 'uppercase',
  };
}

function golos(
  size: number,
  weight: 'regular' | 'semibold' | 'bold',
  lh = 1.3,
  spacing = 0,
  caps = false
): Variant {
  return {
    fontFamily: FONT.golos[weight],
    fontSize: size,
    lineHeight: Math.round(size * lh),
    letterSpacing: em(size, spacing),
    ...(caps ? { textTransform: 'uppercase' as const } : null),
  };
}

export const TYPE = {
  /** заголовок экрана: «ПРИВЫЧКИ» */
  display: oswald(44, 0.95),
  /** заголовок документа: «ПРОБЕЖАТЬ ПОЛУМАРАФОН» */
  title: oswald(28, 1.05),
  /** подзаголовок рядом с числом: «ДНЕЙ ОСТАЛОСЬ» */
  subtitle: oswald(18, 1.1, 0, false),
  /** главное число: дни до срока */
  numberXL: oswald(64, 0.9),
  /** число итога, серии: «4/5», «14» */
  numberL: oswald(34, 1),
  /** число в строке: «47», «−3» */
  numberM: oswald(26, 1),
  /** надпись на печати */
  stamp: oswald(15, 1.2, 0.12),
  /** большая кнопка: «ЗАКРЫТЬ ДЕНЬ» */
  button: oswald(20, 1.2, 0.14),

  /** метка над заголовком экрана: «3 ДОГОВОРА · 1 ЗАКРЫТ» */
  kicker: golos(12, 'bold', 1.3, 0.14, true),
  /** метка раздела и поля: «ОСТАЛЬНЫЕ», «ЗАЧЁТ, ЕСЛИ» */
  label: golos(11, 'bold', 1.3, 0.16, true),
  /** название в строке списка */
  rowTitle: golos(17, 'bold', 1.25),
  /** дело / привычка в строке с чекбоксом */
  item: golos(16, 'semibold', 1.3),
  /** основной текст, поля ввода */
  body: golos(15, 'regular', 1.5),
  /** выделенный текст, значения */
  bodyStrong: golos(15, 'semibold', 1.4),
  /** подпись под строкой: «вчера · Личное» */
  meta: golos(12, 'regular', 1.35),
  /** подпись дня недели над клеткой */
  dayLabel: golos(10, 'bold', 1.2, 0.06, true),
  /** надпись в клетке недели: «СЛИВ», «ВЫХ» */
  cell: oswald(12, 1.1, 0.03),
  /** вкладка таб-бара, кнопки сегментов */
  tab: golos(11, 'bold', 1.2, 0.08, true),
} as const satisfies Record<string, Variant>;

export type TypeVariant = keyof typeof TYPE;
