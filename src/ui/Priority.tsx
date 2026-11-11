/** Важность ромбиками с обводкой: 0 — нет, 1–2 — жёлтые, 3 — красные. */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { RADIUS, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { designStyles } from '../theme/design';

export type PriorityLevel = 0 | 1 | 2 | 3;

export function PriorityMarks({ level, size = 10 }: { level: PriorityLevel; size?: number }) {
  const p = usePalette();
  const t = useT();
  if (!level) return null;
  return (
    <View
      accessible
      accessibilityLabel={t('a11y.priority', { count: level })}
      style={{ flexDirection: 'row', gap: size * 0.5, paddingHorizontal: 2 }}
    >
      {Array.from({ length: level }, (_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: level === 3 ? p.red : p.sun,
            borderWidth: STROKE.thin,
            borderColor: p.line,
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
                borderWidth: STROKE.outline,
                borderColor: p.line,
                backgroundColor: sel ? p.tag : p.surface,
              },
              sel && hardShadow(p, 'sm'),
            ]}
          >
            {n === 0 ? (
              <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: p.muted }} />
            ) : (
              <PriorityMarks level={n} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
    cell: {
      flex: 1,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.sm,
    },
  })
);
