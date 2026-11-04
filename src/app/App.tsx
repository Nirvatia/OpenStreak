import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDataStore } from '../core/store';
import { NewSheet } from '../features/new/NewSheet';
import { useAppFonts } from '../hooks/useFonts';
import { RootNavigator } from '../navigation/RootNavigator';
import { usePrefsStore } from '../store/prefsStore';
import { usePalette, useThemeStore } from '../store/themeStore';
import { CatalogScreen } from '../ui/catalog/CatalogScreen';
import { isCatalogRequested } from '../ui/catalog/isCatalog';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { ToastHost } from '../ui/ToastHost';
import { bootstrap } from './bootstrap';
import { WebFrame } from './WebFrame';

export const App: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const ready = useDataStore((s) => s.ready);
  const scheme = useThemeStore((s) => s.scheme);
  const p = usePalette();

  useEffect(() => {
    // Тема и тон с устройства — только для заставки; дальше их ведут настройки в данных.
    void useThemeStore.getState().loadTheme();
    void usePrefsStore.getState().loadPrefs();
    void bootstrap();
  }, []);

  if (!fontsLoaded || !ready) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.bg }}
      >
        <ActivityIndicator size="large" color={p.text} />
      </View>
    );
  }

  const statusBar = <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;

  if (isCatalogRequested()) {
    return (
      <WebFrame>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            {statusBar}
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
          {statusBar}
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <NewSheet />
          <ToastHost bottom={TAB_BAR_SPACE} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </WebFrame>
  );
};
