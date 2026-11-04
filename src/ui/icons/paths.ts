/**
 * Иконки «Штампа» из макета (`design/stamp/B-Kit.dc.html`): сетка 24, линия 2.5,
 * квадратные концы и острые углы. Один путь `d` на иконку — рисуется только обводкой.
 */
export const UI_ICONS = {
  today: 'M3 11 L12 4 L21 11 V20 H3 Z M9 20 V14 H15 V20',
  tasks: 'M4 4 H20 V20 H4 Z M8 12 L11 15 L16 9',
  habits: 'M8 3 L4 21 M14 3 L10 21 M20 3 L16 21',
  goals: 'M12 2 V7 M12 17 V22 M2 12 H7 M17 12 H22 M12 7 L17 12 L12 17 L7 12 Z',
  stats: 'M3 21 H21 M5 21 V14 M10 21 V9 M15 21 V12 M20 21 V4',
  streak: 'M12 2 L17 9 L15 10 L19 15 L12 22 L5 15 L9 10 L7 9 Z',
  rest: 'M15 3 L9 6 L7 12 L9 18 L15 21 L11 15 L11 9 Z',
  place: 'M12 22 L5 11 V7 L9 3 H15 L19 7 V11 Z M10 8 H14 V12 H10 Z',
  remind: 'M6 17 V10 L12 4 L18 10 V17 Z M4 17 H20 M10 21 H14',
  settings: 'M12 2 L21 7 V17 L12 22 L3 17 V7 Z M12 9 L15 12 L12 15 L9 12 Z',
  area: 'M12 3 L20 7 V13 L12 21 L4 13 V7 Z',
  delete: 'M4 6 H20 M9 6 V3 H15 V6 M6 6 L7 21 H17 L18 6',
  calendar: 'M3 5 H21 V21 H3 Z M3 10 H21 M8 2 V6 M16 2 V6',
  search: 'M4 4 H15 V15 H4 Z M15 15 L21 21',
  // Из экранов макета.
  plus: 'M12 4 V20 M4 12 H20',
  back: 'M20 12 H4 M10 6 L4 12 L10 18',
  chevron: 'M9 5 L16 12 L9 19',
  arrow: 'M4 12 H20 M14 6 L20 12 L14 18',
  close: 'M5 5 L19 19 M19 5 L5 19',
  check: 'M5 12 L10 17 L19 7',
} as const;

/**
 * Иконки привычек в том же стиле. Ключи совпадают со старым набором (`Habit.icon`),
 * чтобы сохранённые привычки получили новую иконку без миграции.
 */
export const HABIT_ICONS = {
  dumbbell: 'M3 9 H6 V15 H3 Z M18 9 H21 V15 H18 Z M6 12 H18 M8 6 V18 M16 6 V18',
  book: 'M4 5 H11 V20 H4 Z M13 5 H20 V20 H13 Z',
  nosmoking: 'M3 14 H17 V18 H3 Z M20 14 V18 M17 6 C17 9 20 9 20 12',
  clock: 'M12 7 V12 L15 15 M12 21 A8 8 0 1 0 12 5 A8 8 0 1 0 12 21',
} as const;

export type UiIconName = keyof typeof UI_ICONS;
export type HabitIconName = keyof typeof HABIT_ICONS;
