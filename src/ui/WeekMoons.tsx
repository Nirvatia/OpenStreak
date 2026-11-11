/** Неделя привычки — семь лун с подписью дня; месяц — сетка лун по 7 в ряд. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette, usePlain } from '../store/themeStore';
import { TYPE } from '../theme/type';
import { Moon } from './Moon';
import { PlainDay } from './PlainMark';
import { moonLook, type DayState } from './moon';

export type MoonDay = {
  /** 0 = вс … 6 = сб */
  weekday: number;
  state: DayState;
  /** доля для partial / today */
  part?: number;
  today?: boolean;
};

export function WeekMoons({ days, size = 28 }: { days: MoonDay[]; size?: number }) {
  const p = usePalette();
  const plain = usePlain();
  const t = useT();
  return (
    <View style={styles.week}>
      {days.map((d, i) => {
        const look = moonLook(d.state, d.part);
        return (
          <View key={i} style={styles.day}>
            {plain ? (
              <PlainDay state={d.state} part={d.part} today={d.today} size={size} />
            ) : (
              <Moon size={size} {...look} />
            )}
            <Text style={[TYPE.tiny, { color: d.today ? p.text : p.muted }]}>
              {t(`day.short.${d.weekday % 7}` as 'day.short.0')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function MoonGrid({ days, size = 26 }: { days: Omit<MoonDay, 'weekday'>[]; size?: number }) {
  const plain = usePlain();
  return (
    <View style={styles.grid}>
      {days.map((d, i) => (
        <View key={i} style={styles.cell}>
          {plain ? (
            <PlainDay state={d.state} part={d.part} today={d.today} size={size} />
          ) : (
            <Moon size={size} {...moonLook(d.state, d.part)} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, alignItems: 'center', gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  cell: { width: `${100 / 7}%`, alignItems: 'center' },
});
