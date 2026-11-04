/**
 * Чип: сфера, фильтр, «Сегодня / Завтра». Выбранный — залит чернилами.
 * Пунктирный — действие «добавить» («+ СФЕРА», «Дата…»).
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';
import { TYPE } from '../theme/type';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** sm — метка капсом (сферы, фильтры); md — обычный текст (выбор дня) */
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
  const sm = size === 'sm';
  return (
    <Pressable
      accessibilityRole={dashed ? 'button' : role === 'radio' ? 'radio' : 'togglebutton'}
      accessibilityState={
        dashed ? undefined : role === 'radio' ? { checked: selected } : { selected }
      }
      onPress={onPress}
      style={({ pressed }) => ({
        height: sm ? 34 : 40,
        paddingHorizontal: sm ? 12 : 14,
        borderWidth: sm ? LINE.row : LINE.frame,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: p.ink,
        backgroundColor: selected ? p.ink : pressed ? p.paper : 'transparent',
        justifyContent: 'center',
      })}
    >
      <Text
        style={[
          sm
            ? [TYPE.tab, { fontSize: 13, letterSpacing: 0.8 }]
            : [TYPE.bodyStrong, { fontFamily: TYPE.kicker.fontFamily, fontSize: 14 }],
          { color: selected ? p.onInk : p.ink },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
