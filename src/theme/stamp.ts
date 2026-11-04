/**
 * Метрики стиля «Штамп» по макету `design/stamp/B-Kit.dc.html`: всё рисуется «чернилами» —
 * сплошные рамки, пунктир между строками, тень-оттиск без размытия, без скруглений.
 */

/** Толщина линий. */
export const LINE = {
  /** пунктир между строками списка */
  hair: 1,
  /** разделитель под строкой привычки, обычная кнопка-клетка */
  row: 2,
  /** рамка карточки, поля, сегментного переключателя */
  frame: 2.5,
  /** печать, выбранный вариант */
  bold: 3,
} as const;

/** Сдвиг тени-оттиска (по x и y одинаковый, размытия нет). */
export const PRINT = {
  /** квадратная кнопка в шапке */
  sm: 4,
  /** главная кнопка, «+» */
  md: 5,
  /** карточка-документ (договор цели) */
  lg: 6,
} as const;

/** Тень-оттиск для `style.boxShadow` (iOS и Android на новой архитектуре, веб). */
export function printShadow(offset: number, color: string): string {
  return `${offset}px ${offset}px 0px ${color}`;
}

export const SPACE = {
  /** поля экрана слева и справа */
  screenX: 20,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const SIZE = {
  /** минимальная зона нажатия */
  touch: 44,
  /** главная кнопка «+» */
  fab: 60,
  /** большая кнопка внизу экрана */
  action: 60,
  tabBar: 84,
} as const;

/** Печати ставятся с поворотом в этом диапазоне — «от руки». */
export const STAMP_TILT = { min: -12, max: 8 } as const;

/**
 * Поворот печати, стабильный для одного и того же ключа (id записи): при перерисовке
 * печать не «прыгает», а у соседних записей наклон разный.
 */
export function stampTilt(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const span = STAMP_TILT.max - STAMP_TILT.min;
  return STAMP_TILT.min + (Math.abs(h) % (span + 1));
}
