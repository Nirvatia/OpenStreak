/**
 * Шкала текста «Мульта» (design/mult): Unbounded — заголовки и числа, Rubik — всё остальное.
 * Подписи обычным регистром, цифры табличные. Цвет не задаётся: его берут из палитры.
 */
import type { TextStyle } from 'react-native';
import { FONT } from './fonts';

type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontVariant'
>;

function make(family: string, size: number, lh: number, tracking: number): Variant {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: Math.round(size * lh),
    letterSpacing: Math.round(size * tracking * 100) / 100,
    fontVariant: ['tabular-nums'],
  };
}

/** Unbounded: заголовки, числа, главная кнопка. */
const display = (size: number, weight: keyof typeof FONT.unbounded, lh = 1.15, tracking = 0) =>
  make(FONT.unbounded[weight], size, lh, tracking);

/** Rubik: текст. */
const text = (size: number, weight: keyof typeof FONT.rubik, lh = 1.3) =>
  make(FONT.rubik[weight], size, lh, 0);

export const TYPE = {
  /** «День закрыт.» */
  display: display(40, 'extrabold', 1.05, -0.02),
  /** счёт дня: «3 / 8» */
  numberXL: display(44, 'extrabold', 1.05, -0.02),
  /** вторая часть счёта: « / 8» */
  numberXLLight: display(44, 'semibold', 1.05, -0.02),
  /** счёт на карточке привычки: «60 / 100» */
  numberScore: display(34, 'extrabold', 1.05, -0.02),
  numberScoreLight: display(34, 'semibold', 1.05, -0.02),
  /** заголовок экрана: «Привычки» */
  title: display(30, 'extrabold', 1.15, -0.02),
  /** звание: «Волк» */
  rank: display(32, 'extrabold', 1.1),
  /** число на наклейке: «47», «23» */
  numberL: display(28, 'extrabold', 1.1),
  /** число в строке: серия «14», «−3» */
  numberM: display(20, 'extrabold', 1.15),
  /** заголовок наклейки и шторки: «Пробежать полумарафон», «Новое» */
  heading: display(22, 'extrabold', 1.2),
  /** главная кнопка: «Записать» */
  button: display(17, 'bold', 1.25),
  /** дата-плашка в шапке «Сегодня» */
  dateLine: display(15, 'bold', 1.3),
  /** бейдж: «+30 очков», «60/100» */
  badge: display(13, 'bold', 1.3),
  /** главное поле шторки */
  input: text(20, 'semibold', 1.3),
  /** выделенное: название привычки */
  itemStrong: text(17, 'semibold', 1.3),
  /** дело или привычка в строке */
  item: text(16, 'medium', 1.3),
  /** цитата волка */
  quote: text(15, 'medium', 1.35),
  /** строка настроек: «Пацанский тон» */
  row: text(15, 'medium', 1.3),
  /** основной текст, поля ввода */
  body: text(15, 'regular', 1.45),
  /** чипы, сегменты, кнопки второго плана */
  control: text(15, 'semibold', 1.25),
  /** плашка-заголовок: «Осталось · 4» */
  label: text(14, 'bold', 1.3),
  /** пояснение под счётом: «до полнолуния — 5» */
  note: text(14, 'regular', 1.35),
  /** пометка в журнале: «зачёт», «слив» */
  mark: text(13, 'semibold', 1.3),
  /** подпись под строкой, время */
  meta: text(13, 'regular', 1.35),
  /** подпись цитаты: «— волк» */
  caption: text(12, 'regular', 1.3),
  /** вкладка таб-бара */
  tab: text(11, 'medium', 1.25),
  /** подпись дня под луной */
  tiny: text(11, 'regular', 1.2),
} as const satisfies Record<string, Variant>;

export type TypeVariant = keyof typeof TYPE;
