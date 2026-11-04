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
} as const;
