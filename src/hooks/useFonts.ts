import {
  useFonts as useRubik,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import {
  useFonts as useUnbounded,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
  Unbounded_800ExtraBold,
} from '@expo-google-fonts/unbounded';
export function useAppFonts() {
  // «Мульт»: Rubik — текст, Unbounded — заголовки и числа.
  const [rLoaded] = useRubik({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });
  const [uLoaded] = useUnbounded({
    Unbounded_600SemiBold,
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
  });
  return rLoaded && uLoaded;
}
