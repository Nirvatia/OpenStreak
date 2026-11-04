/**
 * Кнопки «Штампа». Нажатие — «оттиск»: кнопка с тенью сдвигается на тень,
 * остальные получают бумажную подложку. Прозрачность не меняем — по правилам контраста.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE, PRINT, printShadow, SIZE } from '../theme/stamp';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

/** Стиль «оттиска» для кнопок с тенью: в нажатом состоянии тень «вдавливается». */
function printed(offset: number, color: string, pressed: boolean): ViewStyle {
  const pressedBy = Math.max(0, offset - 2);
  return pressed
    ? {
        boxShadow: printShadow(offset - pressedBy, color),
        transform: [{ translateX: pressedBy }, { translateY: pressedBy }],
      }
    : { boxShadow: printShadow(offset, color) };
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** primary — залитая чернилами с тенью-оттиском; outline — рамка */
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Большая кнопка внизу экрана или шторки: «ЗАПИСАТЬ», «ЗАКРЫТЬ ДЕНЬ». */
export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const p = usePalette();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary
          ? [
              { backgroundColor: disabled ? p.pencil : p.ink },
              !disabled && printed(PRINT.md, p.stamp, pressed),
            ]
          : {
              borderWidth: LINE.frame,
              borderColor: p.ink,
              backgroundColor: pressed ? p.paper : 'transparent',
            },
        style,
      ]}
    >
      <Text style={[TYPE.button, { color: primary ? p.onInk : p.ink }]}>{label}</Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: UiIconName;
  /** обязательно: у кнопки нет текста */
  label: string;
  onPress?: () => void;
  /** bare — только иконка; frame — в рамке; solid — залитая с тенью-оттиском */
  variant?: 'bare' | 'frame' | 'solid';
};

/** Квадратная кнопка 44 с иконкой: настройки, календарь, «+» в шапке. */
export function IconButton({ icon, label, onPress, variant = 'bare' }: IconButtonProps) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.icon,
        variant === 'frame' && {
          borderWidth: LINE.frame,
          borderColor: p.ink,
          backgroundColor: pressed ? p.paper : 'transparent',
        },
        variant === 'solid' && [{ backgroundColor: p.ink }, printed(PRINT.sm, p.stamp, pressed)],
        variant === 'bare' && pressed && { backgroundColor: p.paper },
      ]}
    >
      <Icon
        name={icon}
        size={variant === 'solid' ? 20 : 22}
        weight={variant === 'solid' ? 3 : 2.5}
        color={variant === 'solid' ? p.onInk : p.ink}
      />
    </Pressable>
  );
}

/** Главная «+» в правом нижнем углу экрана. */
export function Fab({ label, onPress }: { label: string; onPress?: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: p.ink },
        printed(PRINT.md, p.stamp, pressed),
      ]}
    >
      <Icon name="plus" size={26} weight={3} color={p.onInk} />
    </Pressable>
  );
}

type ActionCardProps = { title: string; meta?: string; onPress?: () => void };

/** Карточка-ссылка в рамке со стрелкой: «ПОДВЕСТИ ИТОГ ДНЯ». */
export function ActionCard({ title, meta, onPress }: ActionCardProps) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: p.ink, backgroundColor: pressed ? p.paper : 'transparent' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.subtitle, { color: p.ink, fontFamily: TYPE.title.fontFamily }]}>
          {title}
        </Text>
        {!!meta && <Text style={[TYPE.meta, { color: p.pencil, fontSize: 13 }]}>{meta}</Text>}
      </View>
      <Icon name="arrow" size={22} />
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
  fab: { width: SIZE.fab, height: SIZE.fab, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: LINE.frame,
  },
});
