/**
 * Гранёные иконки «Луны» (design/luna/L-Kit). Каждая — один залитый силуэт на сетке 24:
 * левая половина рисуется основным цветом, правая — цветом тени, как у волка.
 * Отверстия (`holes: true`) — правило evenodd: сквозь них виден фон, цвет подложки не нужен.
 */
export type IconSpec = { d: string; holes?: boolean };

const h = (d: string): IconSpec => ({ d, holes: true });
const s = (d: string): IconSpec => ({ d });

export const UI_ICONS = {
  today: s('M15 2 L7 6 L4 13 L8 20 L16 22 L11 16 L10 9 Z'),
  tasks: h('M4 2 H15 L20 7 V22 H4 Z M7 13 L9 11 L11 13 L16 8 L18 10 L11 17 Z'),
  habits: s('M5 3 H8 L6 21 H3 Z M11 3 H14 L12 21 H9 Z M17 3 H20 L18 21 H15 Z'),
  goals: s('M4 2 H6 V22 H4 Z M6 3 L19 7 L6 11 Z'),
  pack: s('M3 22 V14 L5 12 L7 14 V22 Z M10 22 V8 L12 6 L14 8 V22 Z M17 22 V11 L19 9 L21 11 V22 Z'),
  settings: h('M12 2 L21 7 V17 L12 22 L3 17 V7 Z M12 9 L15 12 L12 15 L9 12 Z'),
  plus: s('M10 3 H14 V10 H21 V14 H14 V21 H10 V14 H3 V10 H10 Z'),
  back: s('M2 12 L10 4 V10 H22 V14 H10 V20 Z'),
  arrow: s('M2 10 H14 V4 L22 12 L14 20 V14 H2 Z'),
  chevron: s('M8 4 L16 12 L8 20 L6 18 L12 12 L6 6 Z'),
  close: s('M4 6 L6 4 L12 10 L18 4 L20 6 L14 12 L20 18 L18 20 L12 14 L6 20 L4 18 L10 12 Z'),
  check: s('M3 12 L5.5 9.5 L10 14 L18.5 5.5 L21 8 L10 19 Z'),
  more: s(
    'M4.5 9 L7.5 12 L4.5 15 L1.5 12 Z M12 9 L15 12 L12 15 L9 12 Z M19.5 9 L22.5 12 L19.5 15 L16.5 12 Z'
  ),
  remind: s('M12 2 L18 8 V16 L21 19 H3 L6 16 V8 Z M10 20 H14 L12 23 Z'),
  place: h('M12 23 L4 10 L8 3 H16 L20 10 Z M12 7 L14.5 9.5 L12 12 L9.5 9.5 Z'),
  calendar: h('M3 5 H7 V2 H9 V5 H15 V2 H17 V5 H21 V22 H3 Z M5 9 H19 V10.5 H5 Z'),
  history: h('M8 2 H16 L22 8 V16 L16 22 H8 L2 16 V8 Z M11 6 H13 V11 L17 14 L16 16 L11 13 Z'),
  delete: s('M3 4 H9 V2 H15 V4 H21 V7 H3 Z M5 8 H19 L17 22 H7 Z'),
  search: h(
    'M10 2 L18 10 L10 18 L2 10 Z M10 6 L14 10 L10 14 L6 10 Z M15 17 L17 15 L22 20 L20 22 Z'
  ),
  edit: s('M3 22 L4 17 L8 21 Z M5 16 L16 5 L20 9 L9 20 Z M17 4 L19 2 L23 6 L21 8 Z'),
} satisfies Record<string, IconSpec>;

/**
 * Иконки привычек и сфер. Ключи совпадают со старым набором (`Habit.icon`, `Area.icon`),
 * поэтому сохранённые записи получают новые иконки без миграции.
 */
export const HABIT_ICONS = {
  // Тело и спорт
  dumbbell: s('M2 9 H5 V6 H8 V11 H16 V6 H19 V9 H22 V15 H19 V18 H16 V13 H8 V18 H5 V15 H2 Z'),
  activity: s('M2 11 H7 L9 5 L13 15 L15 9 L17 11 H22 V13 H16 L15 11.5 L13 19 L9 9 L8 13 H2 Z'),
  running: s(
    'M14 2 H18 V6 H14 Z M7 10 L13 7.5 L16.5 12 L20.5 12.5 L20.2 14.5 L15.5 14 L13.5 11.5 L11.5 15 L15 18 L13.8 22.5 L11.8 22 L12.6 18.8 L9.5 16.2 L6.4 21.6 L4.6 20.6 L9.5 12 L7.8 12.6 Z'
  ),
  swimming: s(
    'M15 3 H19 V7 H15 Z M4 12 L10 7 H14 L12 11 H9 L6 14 Z M2 16 L6 13 L10 16 L14 13 L18 16 L22 13 V15.5 L18 18.5 L14 15.5 L10 18.5 L6 15.5 L2 18.5 Z M2 20.5 L6 17.5 L10 20.5 L14 17.5 L18 20.5 L22 17.5 V20 L18 23 L14 20 L10 23 L6 20 L2 23 Z'
  ),
  breathing: s(
    'M2 6 H14 L16 7 L14 8 H2 Z M2 11 H19 L21 12 L19 13 H2 Z M2 16 H11 L13 17 L11 18 H2 Z'
  ),
  lotus: s(
    'M12 3 L16 10 L12 17 L8 10 Z M7 11 L2 9 L4 17 L11 18 Z M17 11 L22 9 L20 17 L13 18 Z M3 20 H21 V22 H3 Z'
  ),
  medplus: s('M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z'),
  vitamins: h('M3 14 L12 5 L19 12 L10 21 Z M8.2 10.2 L9 9.4 L15.6 16 L14.8 16.8 Z'),
  shower: s(
    'M4 21 V6 L7 3 H12 L15 6 V8 H19 V10 H10 V8 H13 V6.8 L11.2 5 H7.8 L6 6.8 V21 Z M11 12 H13 V14 H11 Z M15 12 H17 V14 H15 Z M19 12 H21 V14 H19 Z M13 16 H15 V18 H13 Z M17 16 H19 V18 H17 Z'
  ),
  // Еда и вода
  drop: s('M12 2 L18 13 L15 20 H9 L6 13 Z'),
  water: h('M5 3 H19 L17 21 H7 Z M6.6 8 H17.4 L17.2 9.5 H6.8 Z'),
  apple: s(
    'M12 7 L17 6 L21 10 V15 L17 21 H7 L3 15 V10 L7 6 Z M11 2 H13 V6.5 H11 Z M13.5 4 L18 2 L17 5 Z'
  ),
  breakfast: s(
    'M4 8 H16 V18 L14 20 H6 L4 18 Z M16 10 H20 V15 H16 V13 H18 V12 H16 Z M7 2 H9 V6 H7 Z M11 2 H13 V6 H11 Z'
  ),
  healthyfood: s(
    'M2 11 H22 L19 19 H5 Z M7 10 L8 5 L10 6 L9 10 Z M11 10 V3 H13 V10 Z M15 10 L14 6 L16 5 L17 10 Z'
  ),
  fruits: s(
    'M12 4 L15 9 L18 15 L16 20 H8 L6 15 L9 9 Z M11.5 1 H13 V4 H11.5 Z M13.5 2 L18 1 L16.5 4 Z'
  ),
  vegetables: s(
    'M3 21 L8 10 L14 16 Z M11 12 L13 4 L14.5 4.5 L12.5 12.5 Z M12 13 L20 11 L20.3 12.5 L12.7 14 Z M11.7 12.3 L19 5 L20 6 L12.7 13.3 Z'
  ),
  // Отказ от вредного
  nosmoking: s(
    'M2 14 H16 V18 H2 Z M17 14 H19 V18 H17 Z M20 14 H22 V18 H20 Z M17 4 L20 7 L18 12 L16 10 Z'
  ),
  noalcohol: h(
    'M10 2 H14 V7 L17 10 V22 H7 V10 L10 7 Z M9.5 13 L11 11.5 L12 13 L13 11.5 L14.5 13 L13 14.5 L14.5 16 L13 17.5 L12 16 L11 17.5 L9.5 16 L11 14.5 Z'
  ),
  phoneoff: h(
    'M7 2 H17 V22 H7 Z M9.5 6 L11 4.5 L12 6 L13 4.5 L14.5 6 L13 7.5 L14.5 9 L13 10.5 L12 9 L11 10.5 L9.5 9 L11 7.5 Z'
  ),
  // Ум и дело
  book: s('M3 4 L11 6 V21 L3 19 Z M21 4 L13 6 V21 L21 19 Z'),
  pencil: s('M3 22 L4 17 L8 21 Z M5 16 L16 5 L20 9 L9 20 Z M17 4 L19 2 L23 6 L21 8 Z'),
  languages: h(
    'M3 3 H21 V21 H3 Z M5 5 H10.5 L8 11 H5 Z M13.5 5 H19 V11 H16 Z M5 13 H8 L10.5 19 H5 Z M16 13 H19 V19 H13.5 Z'
  ),
  bulb: s('M9 16 L5 11 V7 L9 3 H15 L19 7 V11 L15 16 Z M9 18 H15 V20 H9 Z M10 21 H14 V23 H10 Z'),
  target: h('M3 3 H21 V21 H3 Z M6 6 H18 V18 H6 Z M9 9 H15 V15 H9 Z'),
  compass: h('M3 3 H21 V21 H3 Z M15 9 L13 13 L9 15 L11 11 Z'),
  clock: h('M8 2 H16 L22 8 V16 L16 22 H8 L2 16 V8 Z M11 6 H13 V11 L17 14 L16 16 L11 13 Z'),
  wallet: s('M3 7 H19 V11 H14 V15 H19 V20 H3 Z M3 6 L15 2 V6 Z M15 12 H21 V14 H15 Z'),
  // Отдых и быт
  moonstar: s(
    'M14 3 L8 6 L6 12 L8 18 L14 21 L10 15 V9 Z M19 3 L20 6 L23 7 L20 8 L19 11 L18 8 L15 7 L18 6 Z'
  ),
  lounge: s(
    'M2 10 H6 V14 H18 V10 H22 V19 H2 Z M5 9 V6 H19 V9 H17 V12 H7 V9 Z M4 20 H6 V22 H4 Z M18 20 H20 V22 H18 Z'
  ),
  trip: s(
    'M11 22 L12 11 H13 V22 Z M12 11 L4 9 L7 4 Z M13 11 L21 9 L18 4 Z M12.5 10 L10 3 H15 Z M3 22 H21 V23 H3 Z'
  ),
  music: s('M8 17 V4 L20 2 V15 H18 V5.5 L10 7 V17 Z M3 16 H10 V21 H3 Z M13 14 H20 V19 H13 Z'),
  video: s('M2 6 H16 V18 H2 Z M16 10 L22 6 V18 L16 14 Z'),
  cinema: h('M3 6 H21 V10 L19 12 L21 14 V18 H3 V14 L5 12 L3 10 Z M8.5 7 H9.5 V17 H8.5 Z'),
  cleaning: h(
    'M14.5 2 L16.5 3 L12.8 11 H10.6 Z M6 11 H16 L19 21 H3 Z M7.6 14 L6.8 20 H7.8 L8.6 14 Z M11.5 14 V20 H12.5 V14 Z M15.4 14 L16.2 20 H17.2 L16.4 14 Z'
  ),
  sprout: s('M11 21 V12 L5 11 L3 5 L9 6 L12 11 L15 8 L21 7 L19 13 L13 14 V21 Z'),
  // Люди и звери
  compliments: h('M3 4 H21 V16 H11 L6 20 V16 H3 Z M12 13 L8 9 L10 7 L12 9 L14 7 L16 9 Z'),
  dog: h(
    'M5 3 L9 7 H15 L19 3 L21 11 L17 13 V18 L12 21 L7 18 V13 L3 11 Z M9.5 10.5 H11 V12 H9.5 Z M13 10.5 H14.5 V12 H13 Z M11 15.5 H13 L12 17 Z'
  ),
  cat: h(
    'M4 3 L9 8 H15 L20 3 V14 L12 21 L4 14 Z M8.5 11.5 H10.5 V13 H8.5 Z M13.5 11.5 H15.5 V13 H13.5 Z M11 16 H13 L12 17.5 Z'
  ),
  // Прочее
  sparkles: s(
    'M10 3 L12 9 L18 11 L12 13 L10 19 L8 13 L2 11 L8 9 Z M19 2 L20 4 L22 5 L20 6 L19 8 L18 6 L16 5 L18 4 Z'
  ),
  shield: h('M12 2 L20 5 V12 L12 22 L4 12 V5 Z M7 11 L9 9 L11 11 L15 7 L17 9 L11 15 Z'),
} satisfies Record<string, IconSpec>;

export type UiIconName = keyof typeof UI_ICONS;
export type HabitIconName = keyof typeof HABIT_ICONS;
