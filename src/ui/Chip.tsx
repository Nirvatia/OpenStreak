/**
 * Чип-пилюля: сфера, фильтр, «Сегодня / Завтра». Выбранный — жёлтый, с тенью.
 * Пунктирный — действие («Дата…», «+ Сфера»).
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { usePalette, usePlain } from '../store/themeStore';
import { RADIUS, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { TYPE } from '../theme/type';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** sm — фильтры и сферы (38); md — выбор в шторке (40) */
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
  const plain = usePlain();
  if (plain && dashed) {
    // «Обычный»: действие («+ Сфера», «Дата…») — подчёркнутый текст, не рамка.
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{ height: size === 'sm' ? 38 : 40, paddingHorizontal: 4, justifyContent: 'center' }}
      >
        <Text style={[TYPE.control, { color: p.text, textDecorationLine: 'underline' }]}>
          {label}
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole={dashed ? 'button' : role === 'radio' ? 'radio' : 'togglebutton'}
      accessibilityState={
        dashed ? undefined : role === 'radio' ? { checked: selected } : { selected }
      }
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: size === 'sm' ? 38 : 40,
          paddingHorizontal: 14,
          justifyContent: 'center',
          borderWidth: STROKE.thin,
          borderStyle: dashed ? 'dashed' : 'solid',
          borderColor: p.line,
          borderRadius: RADIUS.pill,
          backgroundColor: selected ? p.sun : dashed ? 'transparent' : pressed ? p.tag : p.surface,
        },
        selected && hardShadow(p, 'sm'),
      ]}
    >
      <Text style={[TYPE.control, { color: selected ? p.onSun : p.text }]}>{label}</Text>
    </Pressable>
  );
}
