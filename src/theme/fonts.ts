/** Имена загруженных шрифтов (`hooks/useFonts.ts`). На Android жирность задаётся только файлом. */
export const FONT = {
  /** «Мульт»: текст */
  rubik: {
    regular: 'Rubik_400Regular',
    medium: 'Rubik_500Medium',
    semibold: 'Rubik_600SemiBold',
    bold: 'Rubik_700Bold',
  },
  /** «Мульт»: заголовки и числа */
  unbounded: {
    semibold: 'Unbounded_600SemiBold',
    bold: 'Unbounded_700Bold',
    extrabold: 'Unbounded_800ExtraBold',
  },
  /** только старые экраны; уходят вместе с ними (этап 4) */
  golos: {
    regular: 'GolosText_400Regular',
    medium: 'GolosText_500Medium',
    semibold: 'GolosText_600SemiBold',
    bold: 'GolosText_700Bold',
  },
  manrope: {
    medium: 'Manrope_500Medium',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
} as const;
