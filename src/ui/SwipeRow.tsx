/**
 * Строка со свайпом влево: под ней — действие («вычеркнуть»). Дотянул за порог или смахнул
 * быстро — строка уезжает и действие срабатывает; иначе возвращается на место.
 * Для чтения с экрана то же действие доступно из меню действий строки.
 *
 * Нажатия внутри строки оборачиваются в `guard`: если палец уже тянул строку, отпускание
 * не считается нажатием (иначе свайп заодно открыл бы дело).
 */
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePalette, usePlain } from '../store/themeStore';
import { SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

/** Доля ширины строки, после которой свайп срабатывает. */
const TRIGGER = 0.35;
const TRIGGER_VELOCITY = 1200;

type Guard = <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => void;

type Props = {
  children: (guard: Guard) => React.ReactNode;
  /** подпись действия под строкой и в меню для чтения с экрана */
  label: string;
  icon?: UiIconName;
  onSwipe: () => void;
};

export function SwipeRow({ children, label, icon = 'delete', onSwipe }: Props) {
  const p = usePalette();
  const plain = usePlain();
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const dragged = useRef(false);
  const markDragged = useCallback(() => {
    dragged.current = true;
  }, []);
  // Отпускание пальца приходит к кнопкам чуть позже конца жеста — сбрасываем с запасом.
  const releaseLater = useCallback(() => {
    setTimeout(() => {
      dragged.current = false;
    }, 250);
  }, []);
  const guard: Guard = useCallback(
    (fn) =>
      (...args) => {
        if (!dragged.current) fn(...args);
      },
    []
  );

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-10, 10],
    onActivate: () => {
      scheduleOnRN(markDragged);
    },
    onFinalize: () => {
      scheduleOnRN(releaseLater);
    },
    onUpdate: (e) => {
      x.set(Math.min(0, e.translationX));
    },
    onDeactivate: (e) => {
      const far = width > 0 && -e.translationX > width * TRIGGER;
      if (far || e.velocityX < -TRIGGER_VELOCITY) {
        x.set(withTiming(-width, { duration: 160 }, () => scheduleOnRN(onSwipe)));
      } else {
        x.set(withSpring(0, { damping: 24, stiffness: 300 }));
      }
    },
  });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityActions={[{ name: 'swipe', label }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'swipe' && onSwipe()}
    >
      <View style={[StyleSheet.absoluteFill, styles.under, { backgroundColor: p.tag }]}>
        <Icon name={icon} size={18} tone="text" />
        <Text style={[TYPE.label, { color: p.text }]}>{label}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ backgroundColor: plain ? p.bg : p.surface }, rowStyle]}>
          {children(guard)}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  under: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACE.sm,
    paddingRight: SPACE.lg,
  },
});
