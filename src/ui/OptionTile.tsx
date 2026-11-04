/** Плитка выбора с иконкой: «По времени», «У зала · при входе 150 м». Пустая — пунктир. */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

type Props = {
  icon: UiIconName;
  label: string;
  hint?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function OptionTile({ icon, label, hint, selected = false, onPress }: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="togglebutton"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        borderWidth: LINE.frame,
        borderStyle: selected ? 'solid' : 'dashed',
        borderColor: p.ink,
        backgroundColor: selected ? p.ink : pressed ? p.paper : 'transparent',
      })}
    >
      <Icon name={icon} size={20} color={selected ? p.onInk : p.ink} />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            TYPE.bodyStrong,
            { fontSize: 14, lineHeight: 17, color: selected ? p.onInk : p.ink },
          ]}
        >
          {label}
        </Text>
        {!!hint && (
          <Text
            style={[
              TYPE.meta,
              { fontSize: 11, lineHeight: 14, color: selected ? p.onInkMuted : p.pencil },
            ]}
          >
            {hint}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
