/**
 * Кнопки «Мульта»: главная — жёлтая наклейка (Unbounded), второго плана — светлая наклейка,
 * опасная — красная обводка («Слил сегодня»). Нажатие — тень пропадает, кнопка «вдавливается»;
 * прозрачность не меняем (правила контраста).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette, usePlain } from '../store/themeStore';
import { RADIUS, SHADOW, SIZE, SPACE, STROKE } from '../theme/metrics';
import { hardShadow, type ShadowSize } from '../theme/sticker';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';
import { designStyles } from '../theme/design';

/** Смещение «вдавленной» наклейки: тень исчезает, кнопка садится на её место. */
function pressed(size: Exclude<ShadowSize, 'none'>): ViewStyle {
  const o = SHADOW[size];
  return { transform: [{ translateX: o }, { translateY: o }] };
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const p = usePalette();
  const plain = usePlain();
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  const bg = primary ? (disabled ? p.track : p.sun) : p.surface;
  const fg = primary ? (disabled ? p.muted : p.onSun) : danger ? p.red : p.text;
  const shadow = primary ? 'lg' : 'sm';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed: down }) => [
        styles.button,
        {
          height: primary ? SIZE.action : SIZE.button,
          backgroundColor: bg,
          borderColor: danger ? p.red : p.line,
          borderWidth: plain ? 0 : STROKE.outline,
          borderRadius: primary && !plain ? 18 : RADIUS.md,
        },
        !danger && !disabled && (down ? pressed(shadow) : hardShadow(p, shadow)),
        style,
      ]}
    >
      <Text style={[primary ? TYPE.button : TYPE.control, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: UiIconName;
  /** обязательно: у кнопки нет текста */
  label: string;
  onPress?: () => void;
  /** round — круглая наклейка (шапка), sun — жёлтая круглая («+»), bare — только значок */
  variant?: 'round' | 'sun' | 'bare';
  tone?: 'text' | 'muted';
  /** подложка круглой кнопки: фон экрана внутри шторки */
  on?: 'surface' | 'bg';
};

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'round',
  tone = 'text',
  on = 'surface',
}: IconButtonProps) {
  const p = usePalette();
  const plain = usePlain();
  if (variant === 'bare') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        hitSlop={4}
        style={({ pressed: down }) => [
          styles.bare,
          down && { backgroundColor: p.tag, borderRadius: RADIUS.pill },
        ]}
      >
        <Icon name={icon} size={22} tone={tone} />
      </Pressable>
    );
  }
  const sun = variant === 'sun';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed: down }) => [
        styles.round,
        { backgroundColor: sun ? p.sun : p[on], borderColor: p.line },
        plain && !sun && { borderWidth: 0, backgroundColor: p.surface },
        down ? pressed('sm') : on === 'surface' && hardShadow(p, 'sm'),
      ]}
    >
      <Icon name={icon} size={20} tone={sun ? 'onSun' : tone} />
    </Pressable>
  );
}

/** Строка-приглашение: «+ Запиши дело или привычку» — пунктирная рамка, жёлтый кружок с плюсом. */
export function AddRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const p = usePalette();
  const plain = usePlain();
  if (plain) {
    // «Обычный»: строка списка с плюсом, без рамки.
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed: down }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            minHeight: 56,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: p.divider,
            backgroundColor: down ? p.tag : 'transparent',
          },
        ]}
      >
        <View style={{ width: 24, alignItems: 'center' }}>
          <Icon name="plus" size={22} tone="text" />
        </View>
        <Text style={[TYPE.item, { color: p.text }]}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed: down }) => [
        styles.add,
        { borderColor: p.line, backgroundColor: down ? p.tag : 'transparent' },
      ]}
    >
      <View style={[styles.plus, { backgroundColor: p.sun, borderColor: p.line }]}>
        <Icon name="plus" size={16} tone="onSun" />
      </View>
      <Text style={[TYPE.item, { color: p.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Строка-ссылка-наклейка с текстом и стрелкой: «Итог дня →». */
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
  const plain = usePlain();
  if (plain) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed: down }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 60,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: p.divider,
            backgroundColor: down ? p.tag : 'transparent',
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.itemStrong, { color: p.text }]}>{title}</Text>
          {!!sub && <Text style={[TYPE.meta, { color: p.muted }]}>{sub}</Text>}
        </View>
        <Icon name="arrow" size={20} tone="text" />
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed: down }) => [
        styles.link,
        { backgroundColor: p.surface, borderColor: p.line },
        down ? pressed('md') : hardShadow(p, 'md'),
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.itemStrong, { color: p.text }]}>{title}</Text>
        {!!sub && <Text style={[TYPE.meta, { color: p.muted }]}>{sub}</Text>}
      </View>
      <Icon name="arrow" size={20} tone="text" />
    </Pressable>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      borderWidth: STROKE.outline,
    },
    bare: { width: SIZE.touch, height: SIZE.touch, alignItems: 'center', justifyContent: 'center' },
    round: {
      width: SIZE.roundButton,
      height: SIZE.roundButton,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.pill,
    },
    add: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACE.md,
      minHeight: 54,
      paddingHorizontal: 14,
      borderWidth: STROKE.outline,
      borderStyle: 'dashed',
      borderRadius: RADIUS.md,
    },
    plus: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.pill,
    },
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACE.md,
      minHeight: SIZE.row,
      paddingHorizontal: SPACE.lg,
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.lg,
    },
  })
);
