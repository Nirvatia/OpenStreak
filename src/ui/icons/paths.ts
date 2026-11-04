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
 * Иконки привычек и сфер в том же стиле. Ключи совпадают со старым набором (`Habit.icon`,
 * `Area.icon`), чтобы сохранённые записи получили новую иконку без миграции.
 * Первые четыре — из макета (`B-Habits`), остальные нарисованы по тем же правилам.
 */
export const HABIT_ICONS = {
  // Тело и спорт
  dumbbell: 'M3 9 H6 V15 H3 Z M18 9 H21 V15 H18 Z M6 12 H18 M8 6 V18 M16 6 V18',
  activity: 'M2 12 H7 L9 6 L13 18 L16 9 L17 12 H22',
  running: 'M14 2 H18 V6 H14 Z M7 10 L13 8 L16 12 L20 13 M13 8 L10 15 L14 18 L13 22 M10 15 L5 21',
  swimming:
    'M15 3 H19 V7 H15 Z M5 12 L10 7 H14 L12 11 M2 17 L6 14 L10 17 L14 14 L18 17 L22 14 M2 21 L6 18 L10 21 L14 18 L18 21 L22 18',
  breathing: 'M3 8 H15 L17 6 L15 4 M3 12 H19 L21 14 L19 16 M3 16 H11 L13 18 L11 20',
  lotus: 'M12 4 L16 11 L12 18 L8 11 Z M8 11 L2 9 L5 17 L12 18 L19 17 L22 9 L16 11 M3 21 H21',
  medplus: 'M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z',
  vitamins: 'M3 14 L12 5 L19 12 L10 21 Z M7.5 9.5 L14.5 16.5',
  shower:
    'M4 21 V6 L7 3 H12 L15 6 V8 M10 8 H20 M11 12 V13 M15 12 V13 M19 12 V13 M13 17 V18 M17 17 V18',
  // Еда и вода
  drop: 'M12 2 L18 12 V15 L15 20 H9 L6 15 V12 Z',
  water: 'M5 3 H19 L17 21 H7 Z M6 8 H18',
  apple: 'M12 7 L17 6 L21 10 V15 L17 21 H7 L3 15 V10 L7 6 Z M12 7 V3 L15 2',
  breakfast: 'M4 8 H16 V18 L14 20 H6 L4 18 Z M16 10 H20 V15 H16 M8 2 V5 M12 2 V5',
  healthyfood: 'M2 11 H22 L19 19 H5 Z M7 11 L9 6 M12 11 V4 M17 11 L15 6',
  fruits: 'M7 14 L10 17 L7 20 L4 17 Z M17 14 L20 17 L17 20 L14 17 Z M7 14 L12 4 L17 14 M12 4 H16',
  vegetables: 'M3 21 L8 10 L14 16 Z M11 13 L13 4 M11 13 L20 11 M11 13 L19 5',
  // Отказ от вредного
  nosmoking: 'M3 14 H17 V18 H3 Z M20 14 V18 M17 6 C17 9 20 9 20 12',
  noalcohol: 'M10 2 H14 V7 L17 10 V22 H7 V10 L10 7 Z M3 3 L21 21',
  phoneoff: 'M7 2 H17 V22 H7 Z M10 18 H14 M3 3 L21 21',
  // Ум и дело
  book: 'M4 5 H11 V20 H4 Z M13 5 H20 V20 H13 Z',
  pencil: 'M4 20 L5 15 L16 4 L20 8 L9 19 Z M13 7 L17 11',
  languages: 'M3 3 H21 V21 H3 Z M3 12 H21 M12 3 L8 12 L12 21 L16 12 Z',
  bulb: 'M9 16 L5 11 V7 L9 3 H15 L19 7 V11 L15 16 Z M9 19 H15 M10 22 H14',
  target: 'M3 3 H21 V21 H3 Z M7 7 H17 V17 H7 Z M11 11 H13 V13 H11 Z',
  compass: 'M3 3 H21 V21 H3 Z M15 9 L13 13 L9 15 L11 11 Z',
  clock: 'M12 7 V12 L15 15 M12 21 A8 8 0 1 0 12 5 A8 8 0 1 0 12 21',
  wallet: 'M3 6 H19 V20 H3 Z M3 6 L15 2 V6 M14 11 H21 V15 H14 Z',
  // Отдых и быт
  moonstar: 'M14 3 L8 6 L6 12 L8 18 L14 21 L10 15 V9 Z M19 4 V10 M16 7 H22',
  lounge: 'M2 10 H6 V14 H18 V10 H22 V19 H2 Z M5 10 V6 H19 V10 M4 19 V22 M20 19 V22',
  trip: 'M12 22 L13 10 M13 10 L5 8 L8 4 Z M13 10 L21 8 L18 4 Z M13 10 L10 3 H16 Z M3 22 H21',
  music: 'M9 17 V4 L20 2 V15 M4 17 H9 V21 H4 Z M15 15 H20 V19 H15 Z',
  video: 'M2 6 H16 V18 H2 Z M16 10 L22 6 V18 L16 14',
  cinema: 'M3 6 H21 V10 L19 12 L21 14 V18 H3 V14 L5 12 L3 10 Z M9 6 V18',
  cleaning: 'M15 2 L11 11 M6 11 H15 L18 21 H3 Z M8 15 L7 21 M11 15 V21 M14 15 L15 21',
  sprout: 'M12 21 V9 M12 12 L6 11 L3 5 L9 6 L12 12 M12 15 L18 13 L21 7 L15 8 L12 15',
  // Люди и звери
  compliments: 'M3 4 H21 V16 H11 L6 20 V16 H3 Z M12 13 L8 9 L10 7 L12 9 L14 7 L16 9 Z',
  dog: 'M5 3 L9 7 H15 L19 3 L21 11 L17 13 V18 L12 21 L7 18 V13 L3 11 Z M10 11 V12 M14 11 V12 M11 16 H13',
  cat: 'M4 3 L9 8 H15 L20 3 V14 L12 21 L4 14 Z M9 12 V13 M15 12 V13 M11 16 H13',
  // Прочее
  sparkles: 'M10 3 L12 9 L18 11 L12 13 L10 19 L8 13 L2 11 L8 9 Z M19 2 V6 M17 4 H21',
  shield: 'M12 2 L20 5 V12 L12 22 L4 12 V5 Z M8 11 L11 14 L16 8',
} as const;

export type UiIconName = keyof typeof UI_ICONS;
export type HabitIconName = keyof typeof HABIT_ICONS;
