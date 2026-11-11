/**
 * «Итоги» в «Обычном» оформлении (design/serious): неделя столбиками, три числа и строки с
 * цифрами. Без званий, очков и оценок — только то, что посчитано из данных.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays, weekday } from '../../core/dates';
import { packWeek } from '../../core/points';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { dayMonth } from '../format';

const BAR_MAX = 96;

export function StatsScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const week = useMemo(() => packWeek(data, today), [data, today]);
  const maxMarks = Math.max(1, ...week.days.map((d) => d.marks));
  const from = addDays(today, -6);

  const numbers = [
    { value: String(week.tasksDone), label: t('pack.tasksDone', { count: week.tasksDone }) },
    { value: String(week.marks), label: t('pack.marks', { count: week.marks }) },
    { value: String(week.bestStreak), label: t('pack.bestStreak') },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader
        kicker={`${dayMonth(t, from)} – ${dayMonth(t, today)}`}
        title={t('tab.stats')}
      />

      <View style={[styles.numbers, { borderColor: p.divider }]}>
        {numbers.map((n, i) => (
          <View
            key={n.label}
            style={[
              styles.number,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: p.divider, paddingLeft: 14 },
            ]}
          >
            <Text style={[TYPE.numberL, { color: p.text }]}>{n.value}</Text>
            <Text style={[TYPE.caption, { color: p.muted }]}>{n.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('pack.week')} />
        <View
          accessible
          accessibilityLabel={week.days.map((d) => d.marks).join(', ')}
          style={styles.bars}
        >
          {week.days.map((d) => {
            const isToday = d.date === today;
            return (
              <View key={d.date} style={styles.barCol}>
                <Text style={[TYPE.mark, { color: p.text }]}>{d.marks}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(4, Math.round((d.marks / maxMarks) * BAR_MAX)),
                      backgroundColor: isToday ? 'transparent' : p.line,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: p.line,
                    },
                  ]}
                />
                <Text
                  style={[isToday ? TYPE.mark : TYPE.tiny, { color: isToday ? p.text : p.muted }]}
                >
                  {t(`day.short.${weekday(d.date)}` as MessageKey)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View>
        {week.cleanStreak !== null && (
          <Row
            name={t('pack.cleanStreak', { count: week.cleanStreak })}
            value={String(week.cleanStreak)}
          />
        )}
        <Row
          name={t('pack.slips', { count: week.slips })}
          value={String(week.slips)}
          alert={week.slips > 0}
        />
      </View>
    </ScrollView>
  );
}

function Row({ name, value, alert }: { name: string; value: string; alert?: boolean }) {
  const p = usePalette();
  return (
    <View style={[styles.row, { borderTopColor: p.divider }]}>
      <Text style={[TYPE.body, { color: p.text }]}>{name}</Text>
      <Text style={[TYPE.row, { color: alert ? p.red : p.muted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
  numbers: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 16 },
  number: { flex: 1, gap: 4 },
  section: { gap: SPACE.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 148 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  bar: { alignSelf: 'stretch' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
    borderTopWidth: 1,
  },
});
