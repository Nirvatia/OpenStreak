/**
 * Шкала текста «Луны» (design/luna/L-Kit): один шрифт — Onest, громкое — только жирностью,
 * подписи — обычным регистром, цифры — табличные. Цвет не задаётся: его берут из палитры.
 */
import type { TextStyle } from 'react-native';
import { FONT } from './fonts';

type Weight = keyof typeof FONT.onest;
type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontVariant'
>;

function onest(size: number, weight: Weight, lh = 1.3, tracking = 0): Variant {
  return {
    fontFamily: FONT.onest[weight],
    fontSize: size,
    lineHeight: Math.round(size * lh),
    letterSpacing: Math.round(size * tracking * 100) / 100,
    fontVariant: ['tabular-nums'],
  };
}

export const TYPE = {
  /** «День закрыт.» */
  display: onest(44, 'extrabold', 1.05, -0.02),
  /** счёт дня: «3 / 9» */
  numberXL: onest(44, 'bold', 1.05, -0.02),
  /** вторая часть счёта: « / 9» */
  numberXLLight: onest(44, 'medium', 1.05, -0.02),
  /** заголовок экрана: «Привычки» */
  title: onest(30, 'bold', 1.15, -0.02),
  /** звание: «Волк» */
  rank: onest(34, 'extrabold', 1.1),
  /** число на карточке: «4/5», «47» */
  numberL: onest(30, 'bold', 1.1),
  /** число в строке: серия «14», «−3» */
  numberM: onest(22, 'bold', 1.15),
  /** заголовок карточки, шторки: «Пробежать полумарафон», «Новое» */
  heading: onest(22, 'bold', 1.2),
  /** главная кнопка */
  button: onest(17, 'bold', 1.25),
  /** дело / привычка в строке */
  item: onest(16, 'medium', 1.3),
  /** строка настроек: «Пацанский тон» */
  row: onest(15, 'medium', 1.3),
  /** выделенное: название привычки на карточке */
  itemStrong: onest(16, 'semibold', 1.3),
  /** цитата волка */
  quote: onest(16, 'medium', 1.35),
  /** строка даты в шапке «Сегодня» */
  dateLine: onest(15, 'semibold', 1.3),
  /** пояснение под счётом: «до полнолуния — 5» */
  note: onest(14, 'regular', 1.35),
  /** подпись цитаты: «— волк» */
  caption: onest(13, 'regular', 1.3),
  /** основной текст, поля ввода */
  body: onest(15, 'regular', 1.45),
  /** кнопки второго плана, сегменты, чипы */
  control: onest(14, 'semibold', 1.25),
  /** подпись раздела: «Осталось 4» */
  label: onest(13, 'medium', 1.3),
  /** пометка в журнале: «зачёт», «слив» */
  mark: onest(13, 'semibold', 1.3),
  /** подпись под строкой, время */
  meta: onest(12, 'regular', 1.35),
  /** вкладка таб-бара */
  tab: onest(11, 'medium', 1.25),
  /** подпись дня под луной */
  tiny: onest(10, 'regular', 1.2),
} as const satisfies Record<string, Variant>;

export type TypeVariant = keyof typeof TYPE;
