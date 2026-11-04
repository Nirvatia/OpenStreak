/**
 * Неделя привычки: 7 клеток с подписью дня. Состояние клетки:
 * done — сделано (залито), today — сегодня, ещё не отмечено (пунктир),
 * slip — срыв, rest — выходной, clean — вредная привычка, чистый день,
 * off — день не по расписанию.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';
import { TYPE } from '../theme/type';

export type DayState = 'done' | 'today' | 'slip' | 'rest' | 'clean' | 'off';
export type WeekDay = { weekday: number; state: DayState };

export function WeekStrip({ days }: { days: WeekDay[] }) {
  const p = usePalette();
  const t = useT();

  const cell = (state: DayState) => {
    switch (state) {
      case 'done':
        return { border: p.ink, bg: p.ink, dashed: false, text: null, fg: p.onInk };
      case 'today':
        return { border: p.ink, bg: 'transparent', dashed: true, text: null, fg: p.ink };
      case 'slip':
        return {
          border: p.stamp,
          bg: 'transparent',
          dashed: false,
          text: t('stamp.slip'),
          fg: p.stamp,
        };
      case 'rest':
        return {
          border: p.rest,
          bg: 'transparent',
          dashed: false,
          text: t('stamp.rest'),
          fg: p.rest,
        };
      case 'clean':
        return {
          border: p.ink,
          bg: 'transparent',
          dashed: false,
          text: t('week.clean'),
          fg: p.ink,
        };
      case 'off':
        return {
          border: p.pencil,
          bg: 'transparent',
          dashed: false,
          text: null,
          fg: p.pencil,
          thin: true,
        };
    }
  };

  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const c = cell(d.state);
        return (
          <View key={i} style={styles.col}>
            <Text style={[TYPE.dayLabel, { color: p.pencil }]}>
              {t(`day.short.${d.weekday % 7}` as 'day.short.0')}
            </Text>
            <View
              style={[
                styles.cell,
                {
                  borderWidth: 'thin' in c ? LINE.hair : LINE.frame,
                  borderColor: c.border,
                  borderStyle: c.dashed ? 'dashed' : 'solid',
                  backgroundColor: c.bg,
                },
              ]}
            >
              {d.state === 'done' ? (
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path
                    d="M5 5 L19 19 M19 5 L5 19"
                    stroke={c.fg}
                    strokeWidth={3.5}
                    strokeLinecap="square"
                    fill="none"
                  />
                </Svg>
              ) : (
                c.text && (
                  <Text style={[TYPE.cell, { color: c.fg }]} numberOfLines={1} adjustsFontSizeToFit>
                    {c.text}
                  </Text>
                )
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  cell: {
    alignSelf: 'stretch',
    height: 34,
    borderWidth: LINE.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
