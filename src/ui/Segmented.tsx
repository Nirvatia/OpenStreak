/** Сегменты-пилюли на подложке: «Все / Полезные / Вредные», «Дело / Привычка / Цель». */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { RADIUS, STROKE } from '../theme/metrics';
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
      style={[styles.frame, { backgroundColor: p[on], borderColor: p.line }]}
    >
      {items.map((it) => {
        const sel = it.value === value;
        return (
          <Pressable
            key={it.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            onPress={() => onChange(it.value)}
            style={[
              styles.item,
              sel
                ? { backgroundColor: p.sun, borderColor: p.line }
                : { borderColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                TYPE.control,
                sel ? { color: p.onSun } : { color: p.text, fontFamily: TYPE.item.fontFamily },
              ]}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderWidth: STROKE.outline,
    borderRadius: RADIUS.pill,
  },
  item: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: STROKE.thin,
    borderRadius: RADIUS.pill,
  },
});
