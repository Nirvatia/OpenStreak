import AsyncStorage from '@react-native-async-storage/async-storage';

export const STATE_KEY = 'CoolTick.v4';
export const THEME_KEY = 'tickdo.theme';
/** Тон текста: обычный / пацанский. */
export const TONE_KEY = 'openstreak.tone';

// Используем AsyncStorage вместо MMKV для Expo Go
export const storage = {
  getString: async (key: string): Promise<string | undefined> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ?? undefined;
    } catch (e) {
      console.warn('Storage get error:', e);
      return undefined;
    }
  },

  setString: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },

  delete: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage delete error:', e);
    }
  },
};
