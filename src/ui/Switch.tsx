/** Переключатель: квадратный, вкл — дорожка чернилами, бегунок цвета печати справа. */
import React from 'react';
import { Pressable, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';

type Props = { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean };

export function Switch({ value, onChange, label, disabled }: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={{
        width: 52,
        height: 30,
        borderWidth: LINE.frame,
        borderColor: p.ink,
        backgroundColor: value ? p.ink : 'transparent',
        justifyContent: 'center',
        alignItems: value ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          marginHorizontal: 3,
          backgroundColor: value ? p.stampOnInk : p.ink,
        }}
      />
    </Pressable>
  );
}
