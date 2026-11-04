/**
 * Строка настроек: название и подсказка слева; справа — системный переключатель
 * или значение со стрелкой (нажатие меняет значение).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE, SIZE, SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon } from './icons';
import { Switch } from './Switch';

type Props = { label: string; hint?: string } & (
  { value: boolean; onChange: (v: boolean) => void } | { value: string; onPress: () => void }
);

export function SettingRow(props: Props) {
  const p = usePalette();
  const text = (
    <View style={styles.text}>
      <Text style={[TYPE.row, { color: p.text }]}>{props.label}</Text>
      {!!props.hint && <Text style={[TYPE.meta, { color: p.muted }]}>{props.hint}</Text>}
    </View>
  );
  if (typeof props.value === 'boolean' && 'onChange' in props) {
    return (
      <View style={[styles.row, { borderBottomColor: p.line }]}>
        {text}
        <Switch value={props.value} onChange={props.onChange} label={props.label} />
      </View>
    );
  }
  const { onPress, value } = props as { value: string; onPress: () => void };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${props.label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: p.line },
        pressed && { backgroundColor: p.surface },
      ]}
    >
      {text}
      <View style={styles.value}>
        <Text style={[TYPE.note, { color: p.muted }]}>{value}</Text>
        <Icon name="chevron" size={14} tone="muted" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACE.md,
    minHeight: SIZE.row,
    borderBottomWidth: LINE.hair,
  },
  text: { flex: 1 },
  value: { flexDirection: 'row', alignItems: 'center', gap: SPACE.tight },
});
