/** Важность тремя столбиками: 0 — нет, 1–3 — сколько заполнено. */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette, usePlain } from '../store/themeStore';
import { RADIUS, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { designStyles } from '../theme/design';

export type PriorityLevel = 0 | 1 | 2 | 3;

export function PriorityMarks({ level }: { level: PriorityLevel; size?: number }) {
  const p = usePalette();
  const plain = usePlain();
  const t = useT();
  if (!level) return null;
  // Три столбика, как уровень сигнала: заполнено столько, какая важность.
  // «Обычный» — чернилами без обводки; «АУФ» — жёлтые с обводкой, как наклейки.
  return (
    <View
      accessible
      accessibilityLabel={t('a11y.priority', { count: level })}
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 18, marginLeft: 8 }}
    >
      {[7, 12, 17].map((h, i) => {
        const on = i < level;
        return (
          <View
            key={i}
            style={{
              width: 5,
              height: h,
              borderRadius: 2,
              backgroundColor: on ? (plain ? p.text : p.sun) : plain ? p.divider : p.track,
              borderWidth: plain ? 0 : 1.5,
              borderColor: p.line,
            }}
          />
        );
      })}
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
  const plain = usePlain();
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
              plain
                ? {
                    // «Обычный»: тихие плитки; выбранная темнее и с чернильной чертой снизу.
                    backgroundColor: sel ? p.track : p.surface,
                    borderBottomWidth: 2,
                    borderBottomColor: sel ? p.line : 'transparent',
                  }
                : {
                    borderWidth: STROKE.outline,
                    borderColor: p.line,
                    backgroundColor: sel ? p.tag : p.surface,
                  },
              !plain && sel && hardShadow(p, 'sm'),
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
