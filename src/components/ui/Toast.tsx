import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useToastStore } from '../../store/toastStore';
import { useThemeStore } from '../../store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Toast: React.FC = () => {
  const { message, visible } = useToastStore();
  const { currentTheme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 16,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Раньше здесь было `!visible && opacity === 0`, но opacity — Animated.Value,
  // а не число: условие всегда ложно. Ранний return заодно срезал бы
  // анимацию исчезновения, поэтому тосты просто всегда смонтированы.

  return (
    <View
      style={StyleSheet.flatten([styles.wrapper, { bottom: insets.bottom + 96 }])}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: currentTheme.colors.text,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Text style={[styles.text, { color: currentTheme.colors.bg }]} numberOfLines={1}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    maxWidth: '92%',
  },
  text: {
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
