/**
 * На вебе (разработка на ПК) показывает приложение в колонке шириной с телефон,
 * чтобы интерфейс в браузере выглядел как на устройстве. Широкая раскладка — этап 5.
 * На iOS и Android ничего не меняет.
 */
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';

/** Ширина колонки: крупный телефон. */
export const WEB_FRAME_WIDTH = 430;
/** Уже этого окна рамка не нужна — приложение и так занимает экран целиком. */
const FRAME_FROM_WIDTH = 600;

export const WebFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
  const colors = useThemeStore((s) => s.currentTheme.colors);

  if (Platform.OS !== 'web' || width < FRAME_FROM_WIDTH) return <>{children}</>;

  return (
    <View style={[styles.outer, { backgroundColor: colors.card2 }]}>
      <View style={[styles.frame, { borderColor: colors.line, backgroundColor: colors.bg }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center' },
  frame: {
    flex: 1,
    width: WEB_FRAME_WIDTH,
    overflow: 'hidden',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
