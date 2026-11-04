/**
 * Иконки «Мульта» (design/mult, M-Icon): контур на сетке 24, скруглённые концы и углы.
 * `d` рисуется линией, `dots` (если есть) — заливкой: глаза, точки, лапы.
 */
export type IconSpec = { d: string; dots?: string };

/** Окружность как путь (для `d` и `dots`). */
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const line = (d: string): IconSpec => ({ d });

export const UI_ICONS = {
  today: line('M15 3a9 9 0 1 0 6 13.5A7.5 7.5 0 0 1 15 3z'),
  tasks: line('M5 4h14v16H5z M8.5 12l2.5 2.5 5-5'),
  habits: line(
    'M12 3c1 4 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-3 2-4.5 2.5-6.5 1.2 1 2 2.5 2 4 1.2-2.2 1.5-5 1-8z'
  ),
  goals: line('M6 21V4 M6 4h12l-2.5 4 2.5 4H6'),
  pack: {
    d: 'M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3s-4-1-4-3z',
    dots: ring(6.5, 10, 1.8) + ring(10, 6.5, 1.8) + ring(14, 6.5, 1.8) + ring(17.5, 10, 1.8),
  },
  settings: line(`M4 7h9M17 7h3M4 17h3M11 17h9 ${ring(15, 7, 2.2)} ${ring(9, 17, 2.2)}`),
  plus: line('M12 5v14M5 12h14'),
  back: line('M19 12H5M11 6l-6 6 6 6'),
  arrow: line('M5 12h14M13 6l6 6-6 6'),
  chevron: line('M9 6l6 6-6 6'),
  close: line('M6 6l12 12M18 6L6 18'),
  check: line('M5 12.5l4.5 4.5L19 7'),
  more: { d: '', dots: ring(6, 12, 1.8) + ring(12, 12, 1.8) + ring(18, 12, 1.8) },
  remind: line('M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20.5a2 2 0 0 0 4 0'),
  place: line(`M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z ${ring(12, 10, 2.5)}`),
  calendar: line('M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5'),
  history: line('M4 12a8 8 0 1 0 2.5-5.8 M4 4v4h4 M12 8v4l3 2'),
  delete: line('M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6'),
  search: line(`${ring(10.5, 10.5, 6.5)} M15.5 15.5L20 20`),
  edit: line('M4 20l1-4L16 5l3 3L8 19z M14 7l3 3'),
} satisfies Record<string, IconSpec>;

/**
 * Иконки привычек и сфер. Ключи совпадают со старым набором (`Habit.icon`, `Area.icon`),
 * поэтому сохранённые записи получают новые иконки без миграции.
 */
export const HABIT_ICONS = {
  // Тело и спорт
  dumbbell: line('M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12'),
  activity: line('M3 12h4l2-6 4 12 2-6h6'),
  running: line(
    `M12 8l-2.5 4.5 3.5 2.5-1 5.5 M12 8l3.5 3 3 .5 M9.5 12.5L6 13.5 M13 15l-4.5 4 ${ring(15.8, 4.5, 1.8)}`
  ),
  swimming: line(
    `${ring(17.8, 6.5, 1.8)} M5 11l5-3 3 3 M3 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0 M3 20c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0`
  ),
  breathing: line('M3 9h11a3 3 0 1 0-3-3 M3 13h15a3 3 0 1 1-3 3 M3 17h7'),
  lotus: line(
    'M12 20c-4 0-8-2-9-6 3 0 6 1 9 4 3-3 6-4 9-4-1 4-5 6-9 6z M12 18c-2-2-3-5-3-8 1 1 2 2 3 4 1-2 2-3 3-4 0 3-1 6-3 8z'
  ),
  // Здоровье
  medplus: line('M9 4h6v5h5v6h-5v5H9v-5H4V9h5z'),
  vitamins: line('M4.5 13.5l9-9a4.2 4.2 0 0 1 6 6l-9 9a4.2 4.2 0 0 1-6-6z M9 9l6 6'),
  shower: line(
    'M4 20V8a4 4 0 0 1 8 0 M8 8h8 M10 12v1 M13 12v1 M16 12v1 M11 16v1 M14 16v1 M17 16v1'
  ),
  drop: line('M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z'),
  // Еда и вода
  water: line('M6 4h12l-1.5 16h-9z M7 9h10'),
  apple: line(
    'M12 7c-2-1.5-7-1-7 5 0 5 3 9 5 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-9 0-6-5-6.5-7-5z M12 7c0-2 1-4 3-4'
  ),
  breakfast: line(
    'M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 10h2a2.5 2.5 0 0 1 0 5h-2 M8 3v3 M12 3v3'
  ),
  healthyfood: line('M3 11h18a9 9 0 0 1-18 0z M8 11c0-3 2-5 4-5 M13 11c0-2 1.5-4 4-4'),
  fruits: line(
    `${ring(10, 16.5, 3)} ${ring(16, 17.5, 3)} M10 13.5c0-4 2-7 6-9 M16 14.5c-.5-4-.5-7 0-10`
  ),
  vegetables: line(
    'M14.5 9.5c-2-2-4.5-1.5-6 .5L4 20l10-4.5c2-1.5 2.5-4 .5-6z M15 9l3-3 M15 9l1-4 M15 9l4-1'
  ),
  // Отказ от вредного
  nosmoking: line('M3 13h12v3.5H3z M18 13v3.5 M4 4l16 16'),
  noalcohol: line('M10 3h4v4l2 3v11H8V10l2-3z M4 4l16 16'),
  phoneoff: line('M7 3h10v18H7z M11 18h2 M4 4l16 16'),
  // Ум и дело
  book: line('M4 5c3-1 6-1 8 1v13c-2-2-5-2-8-1z M20 5c-3-1-6-1-8 1v13c2-2 5-2 8-1z'),
  pencil: line('M15 4l5 5L9 20H4v-5z M13 6l5 5'),
  languages: line('M3 5h10 M8 3v2 M5 5c1 4 4 7 7 8 M11 5c-1 4-4 7-7 8 M13 21l4-9 4 9 M14.5 18h5'),
  bulb: line('M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z'),
  target: { d: `${ring(12, 12, 9)} ${ring(12, 12, 5)}`, dots: ring(12, 12, 1.5) },
  compass: line(`${ring(12, 12, 9)} M15.5 8.5l-2 5-5 2 2-5z`),
  clock: line(`${ring(12, 12, 9)} M12 7v5l3 2`),
  wallet: line('M4 7h15v13H4z M4 7l11-4v4 M15 13h4v3h-4z'),
  // Отдых
  moonstar: line('M14 4a8 8 0 1 0 6 12.5A6.5 6.5 0 0 1 14 4z M19 3v4 M17 5h4'),
  lounge: line('M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3 M2 12h20v5H2z M4 17v2 M20 17v2'),
  trip: line('M21 4L3 11l7 2 2 7z M10 13l11-9'),
  music: line(`M8 17V5l11-2v12 ${ring(5.5, 17, 2.5)} ${ring(16.5, 15, 2.5)}`),
  video: line('M3 6h13v12H3z M16 10l5-3v10l-5-3'),
  cinema: line('M3 9h18v11H3z M3 9l2-5h16l-2 5 M9 4l-2 5 M15 4l-2 5'),
  // Дом и близкие
  cleaning: line('M14 3l-3 9 M6 12h10l2 9H4z M9 16v5 M13 16v5'),
  sprout: line('M12 21v-9 M12 12c0-4-3-6-7-6 0 4 3 6 7 6z M12 10c0-3 2-6 7-6 0 4-3 6-7 6z'),
  compliments: line('M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z'),
  dog: line(
    'M6 8l-2 6 3 1 M18 8l2 6-3 1 M6 8c2-3 10-3 12 0 1 3 1 7-1 10-2 2-8 2-10 0-2-3-2-7-1-10z M10 12h.01 M14 12h.01 M11 16h2l-1 1z'
  ),
  cat: line('M5 4l3 4h8l3-4v9c0 4-3 7-7 7s-7-3-7-7z M10 12h.01 M14 12h.01 M11 15h2l-1 1z'),
  // Прочее
  sparkles: line(
    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z'
  ),
  shield: line('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4'),
} satisfies Record<string, IconSpec>;

export type UiIconName = keyof typeof UI_ICONS;
export type HabitIconName = keyof typeof HABIT_ICONS;
