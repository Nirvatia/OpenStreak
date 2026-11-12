/**
 * Шкала дня в «Обычном» оформлении: по метке на каждое дело и привычку. Сделанное — заливка,
 * открытое — рамка, долг — красная рамка. Вместо луны дня.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePalette } from '../store/themeStore';

export type RailState = 'done' | 'open' | 'debt';

export function DayRail({ items, label }: { items: RailState[]; label: string }) {
  const p = usePalette();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={styles.row}>
      {items.map((state, i) => (
        <View
          key={i}
          style={[
            styles.seg,
            state === 'done'
              ? { backgroundColor: p.sun }
              : { borderWidth: 1.5, borderColor: state === 'debt' ? p.red : p.text },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 8 },
});
