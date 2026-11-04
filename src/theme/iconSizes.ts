// src/theme/iconSizes.ts

/** Сетки выбора иконок (привычки и сферы).
 *  Рычаг один — сколько плиток в ряд. Ширина плитки не задаётся числом,
 *  а считается от ширины ряда (см. getPickerCell), поэтому ряд всегда
 *  заполнен целиком: пустой полосы справа не остаётся. */
const PICKER_COLUMNS = 5;
const PICKER_GAP = 8;
/** Глиф и скругление — доли плитки, чтобы иконки масштабировались вместе с ней. */
const PICKER_GLYPH_RATIO = 0.63;
const PICKER_RADIUS_RATIO = 0.26;

export const ICON_SIZES = {
  // ── Системные иконки (SvgIcon) ──
  svg: {
    xs: 12, // подстрочники в тексте
    sm: 14, // мелкие метки (мета в TaskRow, подстрочник HabitCard)
    md: 18, // кнопки в хедере, чипы
    lg: 22, // средние кнопки (корзина, action)
    xl: 26, // FAB, крупные
  },
  // ── Иконки привычек/сфер (HabitIcon) ──
  habit: {
    xs: 14, // в подстрочнике, мелких метках
    sm: 18, // в чипах сфер
    md: 26, // в карточке привычки, в сетке выбора, в AreaSheet
    lg: 30, // крупные кнопки
    xl: 36, // если понадобится
  },
  // ── Цветные иконки (AppIcon) ──
  app: {
    xs: 20,
    sm: 26,
    md: 34,
    lg: 48,
    xl: 72,
  },
  // ── Лица настроений (FaceIcon) ──
  face: {
    xs: 20,
    sm: 26,
    md: 34,
    lg: 48,
    xl: 72,
  },
  // ── Сетки выбора иконок (IconGrid → EmojiGrid / IconPicker) ──
  picker: {
    columns: PICKER_COLUMNS,
    gap: PICKER_GAP,
    glyphRatio: PICKER_GLYPH_RATIO,
    radiusRatio: PICKER_RADIUS_RATIO,
  },
  // ── Контейнеры (кнопки/чекбоксы/кружки) ──
  containers: {
    habitIconBtn: 38, // кнопка с иконкой привычки
    habitActionBtn: 46, // кнопка отметки (галочка/крест)
    habitSideBtn: 36, // rest/delete в HabitCard
    habitWeekCircle: 30, // кружок дня в HabitWeek
    taskCheckbox: 24, // чекбокс в TaskRow
    areaChip: 32, // иконка в чипе сферы
    areaSheetIcon: 38, // иконка сферы в AreaSheet
    goalIcon: 38, // иконка сферы в GoalCard
    tabIcon: 22, // иконки табов
  },
};

/** Ширина плитки под конкретную ширину ряда.
 *  Округляем вниз: дробные пиксели иначе дают переполнение ряда на волосок,
 *  и последняя плитка переносится на новую строку — та самая пустая колонка. */
export const getPickerCell = (rowWidth: number): number => {
  const { columns, gap } = ICON_SIZES.picker;
  const cell = (rowWidth - gap * (columns - 1)) / columns;
  return Math.max(36, Math.floor(cell));
};
