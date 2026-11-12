/** Плитка выбора с иконкой: «По времени», «У зала · при входе 150 м». Не выбрана — пунктир. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette, usePlain } from '../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';
import { designStyles } from '../theme/design';

type Props = {
  icon: UiIconName;
  label: string;
  hint?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function OptionTile({ icon, label, hint, selected = false, onPress }: Props) {
  const p = usePalette();
  const plain = usePlain();
  return (
    <Pressable
      accessibilityRole="togglebutton"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          borderWidth: selected ? STROKE.outline : STROKE.thin,
          borderStyle: selected || plain ? 'solid' : 'dashed',
          borderColor: p.line,
          backgroundColor: selected ? p.tag : pressed ? p.tag : 'transparent',
        },
        selected && hardShadow(p, 'sm'),
      ]}
    >
      <Icon name={icon} size={20} tone="text" />
      <View style={{ flex: 1 }}>
        <Text style={[TYPE.control, { color: p.text }]}>{label}</Text>
        {!!hint && <Text style={[TYPE.caption, { color: p.muted }]}>{hint}</Text>}
      </View>
    </Pressable>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    tile: {
      flex: 1,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: SPACE.md,
      borderRadius: RADIUS.md,
    },
  })
);
