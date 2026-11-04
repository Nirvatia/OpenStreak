/** Сегментный переключатель в рамке: «ВСЕ / ПОЛЕЗНЫЕ / ВРЕДНЫЕ», важность «— ! !! !!!». */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';
import { TYPE } from '../theme/type';

export type SegmentItem<T extends string> = {
  value: T;
  label: string;
  /** подпись для чтения с экрана, если `label` — значки («!!») */
  a11yLabel?: string;
  /** цвет текста невыбранного сегмента, например `debt` для «!!!» */
  color?: string;
};

type Props<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (v: T) => void;
  /** название группы для чтения с экрана */
  label: string;
  /** text — Golos капсом (фильтры); marks — Oswald (важность) */
  font?: 'text' | 'marks';
  height?: number;
};

export function Segmented<T extends string>(props: Props<T>) {
  const p = usePalette();
  const { items, value, font = 'text', height = 38 } = props;
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={props.label}
      style={[styles.frame, { borderColor: p.ink }]}
    >
      {items.map((it, i) => {
        const on = it.value === value;
        return (
          <Pressable
            key={it.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={it.a11yLabel ?? it.label}
            onPress={() => props.onChange(it.value)}
            style={({ pressed }) => [
              styles.item,
              {
                height,
                backgroundColor: on ? p.ink : pressed ? p.paper : 'transparent',
                borderColor: p.ink,
              },
              i > 0 && { borderLeftWidth: LINE.frame },
            ]}
          >
            <Text
              style={[
                font === 'marks'
                  ? [TYPE.subtitle, { fontFamily: TYPE.title.fontFamily }]
                  : [TYPE.tab, { fontSize: 12, letterSpacing: 1.2 }],
                { color: on ? p.onInk : (it.color ?? p.ink) },
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
  frame: { flexDirection: 'row', borderWidth: LINE.frame },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
