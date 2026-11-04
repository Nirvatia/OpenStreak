/** Плитка выбора с иконкой: «По времени», «У зала · при входе 150 м». Не выбрана — пунктир. */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/metrics';
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
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        borderWidth: LINE.hair,
        borderStyle: selected ? 'solid' : 'dashed',
        borderColor: selected ? p.text : p.muted,
        backgroundColor: selected ? p.raised : pressed ? p.surface : 'transparent',
      })}
    >
      <Icon name={icon} size={20} tone={selected ? 'text' : 'muted'} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.item, { fontSize: 14, color: p.text }]}>{label}</Text>
        {!!hint && <Text style={[TYPE.meta, { color: p.muted }]}>{hint}</Text>}
      </View>
    </Pressable>
  );
}
