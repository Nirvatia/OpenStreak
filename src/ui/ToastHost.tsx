/**
 * Показ тоста: плашка лунного цвета (инверсия) у нижнего края, над таб-баром и над
 * системной полосой навигации (нижний отступ безопасной зоны). `bottom` — высота таб-бара
 * без системного отступа, если он есть на экране. Появляется сдвигом снизу (без прозрачности — в нём текст). Объявляется для чтения с экрана.
 */
import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { usePalette } from '../store/themeStore';
import { SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { useToast } from './toast';

const HIDDEN_Y = 160;

export function ToastHost({ bottom = 0 }: { bottom?: number }) {
  const p = usePalette();
  const current = useToast((s) => s.current);
  const visible = useToast((s) => s.visible);
  const act = useToast((s) => s.act);
  const insets = useSafeAreaInsets();
  const offset = insets.bottom + bottom + SPACE.lg;
  const hiddenY = HIDDEN_Y + offset;
  const y = useSharedValue(hiddenY);

  useEffect(() => {
    y.set(visible ? withSpring(0, { damping: 18 }) : withTiming(hiddenY, { duration: 180 }));
    if (visible && current) AccessibilityInfo.announceForAccessibility(current.text);
  }, [visible, current, y, hiddenY]);

  const slide = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  if (!current) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, styles.layer, { paddingBottom: offset }]}
    >
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: p.text }, slide]}
      >
        <Text style={[TYPE.item, styles.text, { color: p.onText }]}>{current.text}</Text>
        {current.action && (
          <Pressable
            accessibilityRole="button"
            onPress={act}
            hitSlop={8}
            style={({ pressed }) => [
              styles.action,
              { borderLeftColor: p.textShade },
              pressed && { backgroundColor: p.textShade },
            ]}
          >
            <Text style={[TYPE.button, { fontSize: 15, color: p.onText }]}>
              {current.action.label}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { justifyContent: 'flex-end', paddingHorizontal: SPACE.screenX },
  toast: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  text: { flex: 1, paddingVertical: 12, paddingHorizontal: 16 },
  action: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderLeftWidth: 1,
  },
});
