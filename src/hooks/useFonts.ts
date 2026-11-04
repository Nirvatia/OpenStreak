import {
  useFonts as useOnest,
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Onest_800ExtraBold,
} from '@expo-google-fonts/onest';
import {
  useFonts as useGolos,
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
} from '@expo-google-fonts/golos-text';
import {
  useFonts as useManrope,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

export function useAppFonts() {
  const [oLoaded] = useOnest({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    Onest_800ExtraBold,
  });
  // Golos Text и Manrope — только для старых экранов.
  const [gLoaded] = useGolos({
    GolosText_400Regular,
    GolosText_500Medium,
    GolosText_600SemiBold,
    GolosText_700Bold,
  });
  const [mLoaded] = useManrope({
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  return oLoaded && gLoaded && mLoaded;
}
