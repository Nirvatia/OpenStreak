/**
 * Иконки «Обычного» оформления (design/serious): строгий линейный набор на сетке 24 —
 * прямые отрезки, окружности и дуги, острые углы и прямые концы линий (рисуются с
 * `strokeLinecap="square"` и `strokeLinejoin="miter"`). Те же ключи, что у иконок «АУФ»,
 * поэтому сохранённые привычки и сферы получают иконки без миграции.
 * `d` рисуется линией, `dots` (если есть) — заливкой.
 */
import type { IconSpec } from './paths';

/** Окружность как путь (для `d` и `dots`). */
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const line = (d: string): IconSpec => ({ d });
/** Точка: отрезок нулевой длины, с прямыми концами рисуется квадратом. */
const dot = (x: number, y: number) => `M${x} ${y}h.01`;

export const PLAIN_UI_ICONS = {
  today: line(`${ring(12, 12, 8.5)} M12 7.5V12l3.5 2`),
  tasks: line('M5 4h14v16H5z M8.5 12.5l2.5 2.5 4.5-5'),
  habits: line('M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M16.5 13.5v6 M13.5 16.5h6'),
  goals: line('M6 21V3 M6 4h13l-3 4.5 3 4.5H6'),
  pack: line('M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z'),
  settings: line(`M4 7h10 M18 7h2 M4 17h2 M10 17h10 ${ring(16, 7, 2)} ${ring(8, 17, 2)}`),
  stats: line('M5 20v-8 M12 20V5 M19 20V9 M3 21h18'),
  plus: line('M12 5v14M5 12h14'),
  back: line('M19 12H5 M11 5.5L4.5 12 11 18.5'),
  arrow: line('M5 12h14 M13 5.5l6.5 6.5-6.5 6.5'),
  chevron: line('M9 5l7 7-7 7'),
  close: line('M6 6l12 12M18 6L6 18'),
  check: line('M4.5 12.5l5 5L19.5 7'),
  more: { d: '', dots: 'M5 11h2v2H5z M11 11h2v2h-2z M17 11h2v2h-2z' },
  remind: line('M6 17v-6a6 6 0 0 1 12 0v6 M4 17h16 M10 20.5h4'),
  place: line(`M12 21.5l-6.5-8.5a7.5 7.5 0 1 1 13 0z ${ring(12, 10, 2.5)}`),
  calendar: line('M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4'),
  history: line('M4 12a8 8 0 1 0 2.5-5.8 M4 4v4.5h4.5 M12 8v4.5l3 2'),
  delete: line('M4 7h16 M9 7V4h6v3 M6 7v13h12V7 M10 11v6 M14 11v6'),
  search: line(`${ring(10.5, 10.5, 6.5)} M15.5 15.5L20.5 20.5`),
  edit: line('M4 20v-4L15.5 4.5l4 4L8 20z M13 7l4 4'),
} satisfies Record<string, IconSpec>;

export const PLAIN_HABIT_ICONS = {
  // Тело и спорт
  dumbbell: line('M3 9.5v5 M6.5 7v10 M17.5 7v10 M21 9.5v5 M6.5 12h11'),
  activity: line('M3 12h4l2.5-6 5 12L17 12h4'),
  running: line(`${ring(13, 6.3, 1.8)} M11 9l-3 5 4 2.5-.5 5 M11 9l4 3 3 .5 M8 14l-3.5 1`),
  swimming: line(
    `${ring(16.5, 6.8, 1.8)} M4 12l5-3.5 4 3 M3 16.5c2.2 1.5 3.8 1.5 6 0s3.8-1.5 6 0 3.8 1.5 6 0 M3 20.5c2.2 1.5 3.8 1.5 6 0s3.8-1.5 6 0 3.8 1.5 6 0`
  ),
  breathing: line('M3 8h11a3 3 0 1 0-3-3 M3 13h15a3 3 0 1 1-3 3 M3 18h7'),
  lotus: line('M12 5l3 6.5L12 19l-3-7.5z M4 10l5 3 2 6-7-2z M20 10l-5 3-2 6 7-2z'),
  // Здоровье
  medplus: line('M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'),
  vitamins: line('M4.5 14.5l10-10 5 5-10 10z M9.5 9.5l5 5'),
  shower: line(
    'M5 20V9a4 4 0 0 1 8 0 M9 9h8 M10 13v1.5 M13 13v1.5 M16 13v1.5 M11.5 17.5V19 M14.5 17.5V19 M17.5 17.5V19'
  ),
  drop: line('M12 3l6 8a6.5 6.5 0 1 1-12 0z'),
  // Еда и вода
  water: line('M6 4h12l-1.5 16h-9z M7 9.5h10'),
  apple: line(
    'M12 7c-2.5-2-7-1-7 5 0 5 3 9 5 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-9 0-6-4.5-7-7-5z M12 7V3.5l3-1'
  ),
  breakfast: line(
    'M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M16 10h2a2.5 2.5 0 0 1 0 5h-2 M8 3v3 M12 3v3'
  ),
  healthyfood: line('M3 11h18a9 9 0 0 1-18 0z M8 11l3-5 M13 11l4-4'),
  fruits: line(
    `${ring(10, 17, 3.5)} ${ring(17, 18, 3.5)} M10 13.5C10 9 12 6 17 4 M17 14.5C16.5 10 16.5 7 17 4`
  ),
  vegetables: line('M14.5 9.5l-9 10.5 11-4.5z M15 9l3-3 M15 9l1-4 M15 9l4-1'),
  // Отказ от вредного
  nosmoking: line('M3 13h12v3.5H3z M18 13v3.5 M4 4l16 16'),
  noalcohol: line('M9 3h6v5l2 3v10H7V11l2-3z M4 4l16 16'),
  phoneoff: line('M7 3h10v18H7z M10.5 18h3 M4 4l16 16'),
  // Ум и дело
  book: line('M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3z M21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z'),
  pencil: line('M15 4l5 5L9 20H4v-5z M13 6l5 5'),
  languages: line('M3 5h10 M8 3v2 M5 5c1 4 4 7 7 8 M11 5c-1 4-4 7-7 8 M13 21l4-9 4 9 M14.5 18h5'),
  bulb: line('M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z'),
  target: { d: `${ring(12, 12, 9)} ${ring(12, 12, 5)}`, dots: ring(12, 12, 1.5) },
  compass: line(`${ring(12, 12, 9)} M15.5 8.5l-2 5-5 2 2-5z`),
  clock: line(`${ring(12, 12, 9)} M12 7v5l3.5 2`),
  wallet: line('M4 7h16v13H4z M4 7l12-4v4 M15 13h5v4h-5z'),
  // Отдых
  moonstar: line('M14 4a8 8 0 1 0 6 12.5A6.5 6.5 0 0 1 14 4z M19 3v4 M17 5h4'),
  lounge: line('M4 11V8h16v3 M2 12h20v5H2z M4 17v2.5 M20 17v2.5'),
  trip: line('M21 3L3 10.5l7 2.5 2.5 7z M10 13L21 3'),
  music: line(`M8 17V5l11-2v12 ${ring(5.5, 17, 2.5)} ${ring(16.5, 15, 2.5)}`),
  video: line('M3 6h13v12H3z M16 10l5-3v10l-5-3'),
  cinema: line('M3 9h18v11H3z M3 9l2-5h16l-2 5 M9 4L7 9 M15 4l-2 5'),
  // Дом и близкие
  cleaning: line('M14 3l-3 9 M6 12h10l2 9H4z M9 16v5 M13 16v5'),
  sprout: line('M12 21v-9 M12 12c0-4-3-6-7-6 0 4 3 6 7 6z M12 10c0-3 2-6 7-6 0 4-3 6-7 6z'),
  compliments: line('M12 20.5L4.5 13A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 7.5 6z'),
  dog: line(
    `M5 7l-2 6 3 1 M19 7l2 6-3 1 M6 7h12l1 6c0 4-3 7-7 7s-7-3-7-7z ${dot(9.5, 12)} ${dot(14.5, 12)} M11 16h2`
  ),
  cat: line(`M5 4l3 4h8l3-4v9c0 4-3 7-7 7s-7-3-7-7z ${dot(9.5, 12)} ${dot(14.5, 12)} M11 15.5h2`),
  // Прочее
  sparkles: line('M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z M19 3v4 M17 5h4'),
  shield: line('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4'),
} satisfies Record<string, IconSpec>;
