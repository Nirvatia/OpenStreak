import {
  useFonts as useManrope,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  useFonts as useGolos,
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
} from '@expo-google-fonts/golos-text';
import {
  useFonts as useOswald,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';

export function useAppFonts() {
  const [oLoaded] = useOswald({ Oswald_600SemiBold, Oswald_700Bold });
  const [gLoaded] = useGolos({
    GolosText_400Regular,
    GolosText_500Medium,
    GolosText_600SemiBold,
    GolosText_700Bold,
  });
  // Manrope — только для старых экранов.
  const [mLoaded] = useManrope({
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  return oLoaded && gLoaded && mLoaded;
}
