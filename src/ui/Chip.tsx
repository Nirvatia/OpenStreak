/**
 * Чип: сфера, фильтр, «Сегодня / Завтра». Выбранный — инверсия (лунным светом).
 * Пунктирный — действие «добавить» («+ Сфера», «Дата…»).
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/metrics';
import { TYPE } from '../theme/type';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** sm — фильтры и сферы (34); md — выбор дня (40) */
  size?: 'sm' | 'md';
  dashed?: boolean;
  /** toggle — можно выбрать несколько; radio — один из группы */
  role?: 'toggle' | 'radio';
};

export function Chip({
  label,
  selected = false,
  onPress,
  size = 'sm',
  dashed,
  role = 'toggle',
}: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole={dashed ? 'button' : role === 'radio' ? 'radio' : 'togglebutton'}
      accessibilityState={
        dashed ? undefined : role === 'radio' ? { checked: selected } : { selected }
      }
      onPress={onPress}
      style={({ pressed }) => ({
        height: size === 'sm' ? 34 : 40,
        paddingHorizontal: size === 'sm' ? 12 : 14,
        borderWidth: LINE.hair,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: selected ? p.text : dashed ? p.muted : p.line,
        backgroundColor: selected ? p.text : pressed ? p.surface : 'transparent',
        justifyContent: 'center',
      })}
    >
      <Text
        style={[
          TYPE.control,
          { fontSize: size === 'sm' ? 13 : 14, color: selected ? p.onText : p.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
