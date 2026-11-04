import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootTabs } from '../navigation/RootTabs';
import { SheetsHost } from '../components/SheetsHost';
import { useAppStore } from '../store/appStore';
import { useThemeStore } from '../store/themeStore';
import { Toast } from '../components/ui/Toast';
import { useAppFonts } from '../hooks/useFonts';
import { bootstrap } from './bootstrap';

export const App: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const hydrated = useAppStore((s) => s.hydrated);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    void bootstrap();
    void loadTheme();
  }, [loadTheme]);

  if (!fontsLoaded || !hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={currentTheme.colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootTabs />
        </NavigationContainer>
        <SheetsHost />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
