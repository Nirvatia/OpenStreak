/** Прогресс числовой привычки: 10 делений, сделанные залиты чернилами. */
import React from 'react';
import { View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';

const TICKS = 10;

export function filledTicks(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(TICKS, Math.floor((done / total) * TICKS)));
}

export function ProgressTicks({ done, total }: { done: number; total: number }) {
  const p = usePalette();
  const t = useT();
  const filled = filledTicks(done, total);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('a11y.progress', { done, total })}
      accessibilityValue={{ min: 0, max: total, now: Math.min(done, total) }}
      style={{ flexDirection: 'row', gap: 3 }}
    >
      {Array.from({ length: TICKS }, (_, i) => (
        <View
          key={i}
          style={{
            width: 18,
            height: 6,
            backgroundColor: i < filled ? p.ink : 'transparent',
            borderWidth: i < filled ? 0 : 1.5,
            borderColor: p.ink,
          }}
        />
      ))}
    </View>
  );
}
