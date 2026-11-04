/** Важность ромбиками: 0 — нет, 1–2 — лунным светом, 3 — красным. */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/metrics';

export type PriorityLevel = 0 | 1 | 2 | 3;

export function PriorityMarks({ level, size = 7 }: { level: PriorityLevel; size?: number }) {
  const p = usePalette();
  const t = useT();
  if (!level) return null;
  return (
    <View
      accessible
      accessibilityLabel={t('a11y.priority', { count: level })}
      style={{ flexDirection: 'row', gap: size * 0.45 }}
    >
      {Array.from({ length: level }, (_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: level === 3 ? p.blood : p.text,
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

type PickerProps = {
  value: PriorityLevel;
  onChange: (v: PriorityLevel) => void;
  /** подписи вариантов для чтения с экрана: без важности, низкая, средняя, высокая */
  labels: [string, string, string, string];
  label: string;
};

export function PriorityPicker({ value, onChange, labels, label }: PickerProps) {
  const p = usePalette();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {([0, 1, 2, 3] as const).map((n) => {
        const sel = n === value;
        return (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            accessibilityLabel={labels[n]}
            onPress={() => onChange(n)}
            style={[
              styles.cell,
              {
                borderWidth: sel ? LINE.bold : LINE.hair,
                borderColor: sel ? p.text : p.line,
                backgroundColor: sel ? p.raised : 'transparent',
              },
            ]}
          >
            {n === 0 ? (
              <View style={{ width: 14, height: 2, backgroundColor: p.muted }} />
            ) : (
              <PriorityMarks level={n} size={8} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  cell: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' },
});
