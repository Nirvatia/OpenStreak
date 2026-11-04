import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootTabs } from '../navigation/RootTabs';
import { SheetsHost } from '../components/SheetsHost';
import { useAppStore } from '../store/appStore';
import { usePrefsStore } from '../store/prefsStore';
import { useThemeStore } from '../store/themeStore';
import { Toast } from '../components/ui/Toast';
import { useAppFonts } from '../hooks/useFonts';
import { CatalogScreen } from '../ui/catalog/CatalogScreen';
import { ToastHost } from '../ui/ToastHost';
import { isCatalogRequested } from '../ui/catalog/isCatalog';
import { bootstrap } from './bootstrap';
import { WebFrame } from './WebFrame';

export const App: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const hydrated = useAppStore((s) => s.hydrated);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const { currentTheme, scheme } = useThemeStore();

  useEffect(() => {
    void bootstrap();
    void loadTheme();
    void usePrefsStore.getState().loadPrefs();
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

  if (isCatalogRequested()) {
    return (
      <WebFrame>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <CatalogScreen />
            <ToastHost />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </WebFrame>
    );
  }

  return (
    <WebFrame>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <NavigationContainer>
            <RootTabs />
          </NavigationContainer>
          <SheetsHost />
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </WebFrame>
  );
};
