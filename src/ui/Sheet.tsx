/**
 * Шторка «Штампа» поверх экрана: жирная черта сверху, «язычок», заголовок капсом и крестик.
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
import { LINE, SPACE } from '../theme/stamp';
import { TYPE } from '../theme/type';
import { IconButton } from './Button';

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
  const shadeStyle = useAnimatedStyle(() => ({ opacity: shade.get() * (dark ? 0.72 : 0.62) }));

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
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? '#000000' : p.nav },
            shadeStyle,
          ]}
        >
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
              styles.panel,
              {
                maxHeight: Math.round(height * 0.82),
                backgroundColor: p.bg,
                borderTopColor: p.ink,
              },
              panelStyle,
            ]}
          >
            <GestureDetector gesture={drag}>
              <View style={styles.top}>
                <View style={[styles.grabber, { backgroundColor: p.ink }]} />
                <View style={styles.head}>
                  <Text
                    accessibilityRole="header"
                    style={[TYPE.title, { flex: 1, fontSize: 30, lineHeight: 32, color: p.ink }]}
                  >
                    {title}
                  </Text>
                  <View style={{ marginRight: -10 }}>
                    <IconButton icon="close" label={t('common.close')} onPress={onClose} />
                  </View>
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bottom: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
  },
  panel: { borderTopWidth: LINE.bold },
  top: { paddingTop: 12, paddingHorizontal: SPACE.screenX, gap: 6 },
  grabber: { alignSelf: 'center', width: 44, height: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { paddingHorizontal: SPACE.screenX, paddingTop: 12, gap: 18 },
  footer: { paddingHorizontal: SPACE.screenX, paddingTop: 12 },
});
