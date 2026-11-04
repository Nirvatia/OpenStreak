/**
 * Показ тоста: чёрная плашка с тенью-оттиском у нижнего края, над таб-баром.
 * Появляется сдвигом снизу (без прозрачности — в нём текст). Объявляется для чтения с экрана.
 */
import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { usePalette } from '../store/themeStore';
import { PRINT, printShadow, SPACE } from '../theme/stamp';
import { TYPE } from '../theme/type';
import { useToast } from './toast';

const HIDDEN_Y = 160;

export function ToastHost({ bottom = 0 }: { bottom?: number }) {
  const p = usePalette();
  const current = useToast((s) => s.current);
  const visible = useToast((s) => s.visible);
  const act = useToast((s) => s.act);
  const y = useSharedValue(HIDDEN_Y);

  useEffect(() => {
    y.set(visible ? withSpring(0, { damping: 18 }) : withTiming(HIDDEN_Y, { duration: 180 }));
    if (visible && current) AccessibilityInfo.announceForAccessibility(current.text);
  }, [visible, current, y]);

  const slide = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  if (!current) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, styles.layer, { paddingBottom: bottom + SPACE.lg }]}
    >
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          { backgroundColor: p.ink, boxShadow: printShadow(PRINT.md, p.stamp) },
          slide,
        ]}
      >
        <Text style={[TYPE.bodyStrong, styles.text, { color: p.onInk }]}>{current.text}</Text>
        {current.action && (
          <Pressable
            accessibilityRole="button"
            onPress={act}
            hitSlop={8}
            style={({ pressed }) => [
              styles.action,
              { borderLeftColor: p.onInkMuted },
              pressed && { backgroundColor: p.pencil },
            ]}
          >
            <Text style={[TYPE.stamp, { fontSize: 16, color: p.onInk }]}>
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
