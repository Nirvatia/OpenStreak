/**
 * Шторка «Мульта» поверх экрана: наклейка со скруглённым верхом, «язычок», заголовок и круглый крестик.
 * Высота — по содержимому, не больше 82% экрана. Закрывается крестиком, тапом по затемнению,
 * системной «назад» и жестом вниз за верх шторки.
 *
 * Своя реализация на Modal + reanimated + gesture-handler: `BottomSheetModal` из
 * @gorhom/bottom-sheet на вебе не показывается, а шторка должна работать везде одинаково.
 */
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useT } from '../store/prefsStore';
import { usePalette, useThemeStore } from '../store/themeStore';
import { RADIUS, SCRIM_OPACITY, SPACE, STROKE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { IconButton } from './Button';
import { designStyles } from '../theme/design';

/** Сдвиг или скорость жеста вниз, после которых шторка закрывается. */
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 900;

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** закреплено снизу под прокруткой: обычно главная кнопка */
  footer?: React.ReactNode;
};

export function Sheet({ visible, onClose, title, children, footer }: Props) {
  const p = usePalette();
  const dark = useThemeStore((s) => s.scheme === 'dark');
  const t = useT();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Modal остаётся на экране, пока шторка уезжает вниз.
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const y = useSharedValue(height);
  const shade = useSharedValue(0);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      y.set(withSpring(0, { damping: 26, stiffness: 320 }));
      shade.set(withTiming(1, { duration: 200 }));
    } else {
      shade.set(withTiming(0, { duration: 180 }));
      y.set(
        withTiming(height, { duration: 220, easing: Easing.in(Easing.quad) }, (done) => {
          if (done) scheduleOnRN(setMounted, false);
        })
      );
    }
  }, [visible, mounted, height, y, shade]);

  const drag = usePanGesture({
    activeOffsetY: 8,
    onUpdate: (e) => {
      y.set(Math.max(0, e.translationY));
    },
    onDeactivate: (e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        scheduleOnRN(onClose);
      } else {
        y.set(withSpring(0, { damping: 26, stiffness: 320 }));
      }
    },
  });

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  // Затемнение без текста — прозрачность здесь допустима.
  const shadeStyle = useAnimatedStyle(() => ({
    opacity: shade.get() * (dark ? SCRIM_OPACITY.dark : SCRIM_OPACITY.light),
  }));

  if (!mounted) return null;
  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, shadeStyle]}>
          <Pressable
            style={styles.fill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottom}
          pointerEvents="box-none"
        >
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                maxHeight: Math.round(height * 0.86),
                backgroundColor: p.surface,
                borderColor: p.line,
              },
              styles.panel,
              panelStyle,
            ]}
          >
            <GestureDetector gesture={drag}>
              <View style={styles.top}>
                <View style={[styles.grabber, { backgroundColor: p.track }]} />
                <View style={styles.head}>
                  <Text
                    accessibilityRole="header"
                    style={[TYPE.heading, styles.title, { color: p.text }]}
                  >
                    {title}
                  </Text>
                  <IconButton icon="close" on="bg" label={t('common.close')} onPress={onClose} />
                </View>
              </View>
            </GestureDetector>
            <ScrollView
              contentContainerStyle={[
                styles.content,
                !footer && { paddingBottom: insets.bottom + 28 },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            {footer && (
              <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>{footer}</View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    fill: { flex: 1 },
    bottom: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'flex-end',
    },
    panel: {
      borderTopWidth: STROKE.outline,
      borderLeftWidth: STROKE.outline,
      borderRightWidth: STROKE.outline,
      borderTopLeftRadius: RADIUS.sheet,
      borderTopRightRadius: RADIUS.sheet,
    },
    top: { paddingTop: 10, paddingHorizontal: SPACE.screenX, gap: SPACE.sm },
    grabber: { alignSelf: 'center', width: 44, height: 6, borderRadius: 3 },
    title: { flex: 1 },
    head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    content: { paddingHorizontal: SPACE.screenX, paddingTop: SPACE.md, gap: SPACE.lg },
    footer: { paddingHorizontal: SPACE.screenX, paddingTop: SPACE.md },
  })
);
