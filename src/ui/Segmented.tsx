/** Сегменты на подложке: «Все / Полезные / Вредные», «Дело / Привычка / Цель». */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';

export type SegmentItem<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (v: T) => void;
  /** название группы для чтения с экрана */
  label: string;
  /** подложка: surface на фоне экрана, bg — внутри шторки */
  on?: 'surface' | 'bg';
};

export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  on = 'surface',
}: Props<T>) {
  const p = usePalette();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.frame, { backgroundColor: p[on] }]}
    >
      {items.map((it) => {
        const sel = it.value === value;
        return (
          <Pressable
            key={it.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            onPress={() => onChange(it.value)}
            style={[styles.item, { backgroundColor: sel ? p.raised : 'transparent' }]}
          >
            <Text style={[TYPE.control, { color: sel ? p.text : p.muted }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexDirection: 'row', padding: 3, gap: 3 },
  item: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
});
