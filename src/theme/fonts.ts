/** Имена загруженных шрифтов (`hooks/useFonts.ts`). На Android жирность задаётся только файлом. */
export const FONT = {
  /** «Луна»: единственный шрифт интерфейса */
  onest: {
    regular: 'Onest_400Regular',
    medium: 'Onest_500Medium',
    semibold: 'Onest_600SemiBold',
    bold: 'Onest_700Bold',
    extrabold: 'Onest_800ExtraBold',
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
