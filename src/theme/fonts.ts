/** Имена загруженных шрифтов (`hooks/useFonts.ts`). На Android жирность задаётся только файлом. */
export const FONT = {
  /** «Штамп»: заголовки капсом, числа, печати, кнопки */
  oswald: {
    semibold: 'Oswald_600SemiBold',
    bold: 'Oswald_700Bold',
  },
  /** «Штамп»: весь текст */
  golos: {
    regular: 'GolosText_400Regular',
    /** только старые экраны */
    medium: 'GolosText_500Medium',
    semibold: 'GolosText_600SemiBold',
    bold: 'GolosText_700Bold',
  },
  /** только старые экраны; уходит вместе с ними (этап 3) */
  manrope: {
    medium: 'Manrope_500Medium',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
} as const;
