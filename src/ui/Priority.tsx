/** Важность: ромбики с обводкой в «АУФ» (0 — нет, 1–2 — жёлтые, 3 — красные), столбики в «Обычном». */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette, usePlain } from '../store/themeStore';
import { RADIUS, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { designStyles } from '../theme/design';

export type PriorityLevel = 0 | 1 | 2 | 3;

export function PriorityMarks({ level, size = 10 }: { level: PriorityLevel; size?: number }) {
  const p = usePalette();
  const plain = usePlain();
  const t = useT();
  if (!level) return null;
  if (plain) {
    // «Обычный»: три столбика, как уровень сигнала; заполнено столько, какая важность.
    return (
      <View
        accessible
        accessibilityLabel={t('a11y.priority', { count: level })}
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 16, marginLeft: 8 }}
      >
        {[6, 10, 14].map((h, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 1,
              backgroundColor: i < level ? p.text : p.divider,
            }}
          />
        ))}
      </View>
    );
  }
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
            borderWidth: plain ? 0 : STROKE.thin,
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
