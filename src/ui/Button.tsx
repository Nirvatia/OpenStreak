/**
 * Кнопки «Луны»: главная — лунным светом (инверсия), второстепенная — в тонкой рамке,
 * опасная — красной рамкой. Нажатие — смена подложки; прозрачность не меняем (правила контраста).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE, SIZE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const p = usePalette();
  const primary = variant === 'primary';
  const fg = primary ? p.onText : variant === 'danger' ? p.blood : p.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary
          ? { backgroundColor: disabled ? p.muted : pressed ? p.textShade : p.text }
          : {
              height: 48,
              borderWidth: LINE.hair,
              borderColor: variant === 'danger' ? p.blood : p.line,
              backgroundColor: pressed ? p.surface : 'transparent',
            },
        style,
      ]}
    >
      <Text style={[primary ? TYPE.button : TYPE.item, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: UiIconName;
  /** обязательно: у кнопки нет текста */
  label: string;
  onPress?: () => void;
  /** bare — только иконка; solid — квадрат лунного цвета («+ привычка») */
  variant?: 'bare' | 'solid';
  tone?: 'text' | 'muted';
};

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'bare',
  tone = 'text',
}: IconButtonProps) {
  const p = usePalette();
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={solid ? 0 : 4}
      style={({ pressed }) => [
        styles.icon,
        solid && { backgroundColor: pressed ? p.textShade : p.text },
        !solid && pressed && { backgroundColor: p.surface },
      ]}
    >
      <Icon name={icon} size={solid ? 18 : 22} tone={solid ? 'onText' : tone} />
    </Pressable>
  );
}

/** Строка-приглашение вверху списка: «+ Запиши дело или привычку» (вместо плавающей «+»). */
export function AddRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.add, { backgroundColor: pressed ? p.raised : p.surface }]}
    >
      <Icon name="plus" size={18} tone="text" />
      <Text style={[TYPE.body, { color: p.muted }]}>{label}</Text>
    </Pressable>
  );
}

/** Строка-ссылка с текстом и стрелкой: «Итог дня →». */
export function LinkRow({
  title,
  sub,
  onPress,
}: {
  title: string;
  sub?: string;
  onPress?: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.link, { backgroundColor: pressed ? p.raised : p.surface }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.itemStrong, { color: p.text }]}>{title}</Text>
        {!!sub && <Text style={[TYPE.meta, { color: p.muted }]}>{sub}</Text>}
      </View>
      <Icon name="arrow" size={18} tone="muted" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: SIZE.action,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: { width: SIZE.touch, height: SIZE.touch, alignItems: 'center', justifyContent: 'center' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
  },
});
