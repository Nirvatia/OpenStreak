import { Platform } from 'react-native';

/** Показать каталог вместо приложения: только в разработке. */
export function isCatalogRequested(): boolean {
  if (!__DEV__) return false;
  if (process.env.EXPO_PUBLIC_CATALOG === '1') return true;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).has('catalog');
  }
  return false;
}
