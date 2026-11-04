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
import { checkReminders } from '../utils/reminders';
import { useAppFonts } from '../hooks/useFonts';

export const App: React.FC = () => {
  const fontsLoaded = useAppFonts();
  const loadState = useAppStore((s) => s.load);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const state = useAppStore((s) => s.state);
  const setState = useAppStore((s) => s.setState);
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    loadState();
    loadTheme();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders(state.tasks, state.habits, state.fired, (key) => {
        setState((prev) => ({ ...prev, fired: { ...prev.fired, [key]: 1 } }));
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [state.tasks, state.habits, state.fired, setState]);

  if (!fontsLoaded) {
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
