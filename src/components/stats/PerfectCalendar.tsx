import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { isPerfect } from '../../utils/moods';
import { addDays, monthTitle, todayStr } from '../../utils/text';
import { SvgIcon } from '../icons/SvgIcon';

const DOW_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export const PerfectCalendar: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const [cursor, setCursor] = useState(todayStr());
  const tb = todayStr();

  const navigate = (dir: number) => {
    const dt = new Date(cursor + 'T00:00');
    dt.setMonth(dt.getMonth() + dir);
    setCursor(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    );
  };

  const dt = new Date(cursor + 'T00:00');
  const y = dt.getFullYear();
  const m = dt.getMonth();
  const firstDay = new Date(y, m, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = addDays(`${y}-${String(m + 1).padStart(2, '0')}-01`, -startOffset);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(startDate, i);
    const cellDate = new Date(d + 'T00:00');
    const isOtherMonth = cellDate.getMonth() !== m;
    const isFuture = d > tb;
    const isPerfectDay = isPerfect(d, state.habits, state.startedAt);
    const isToday = d === tb;

    cells.push(
      <View
        key={`${d}-${i}`}
        style={[styles.cell, isOtherMonth && { opacity: 0.3 }, isFuture && { opacity: 0.35 }]}
      >
        <View
          style={[
            styles.dayNumber,
            isPerfectDay && { backgroundColor: currentTheme.colors.orange },
            isToday && !isPerfectDay && { backgroundColor: currentTheme.colors.accent },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: currentTheme.colors.text },
              (isPerfectDay || isToday) && { color: '#fff' },
            ]}
          >
            {cellDate.getDate()}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
          onPress={() => navigate(-1)}
          activeOpacity={0.7}
        >
          <SvgIcon name="chevl" size={18} color={currentTheme.colors.muted} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: currentTheme.colors.text }]}>
          {monthTitle(y, m)}
        </Text>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
          onPress={() => navigate(1)}
          activeOpacity={0.7}
        >
          <SvgIcon name="chevr" size={18} color={currentTheme.colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.dowRow}>
        {DOW_LABELS.map((d) => (
          <View key={d} style={styles.dowCol}>
            <Text style={[styles.dow, { color: currentTheme.colors.muted }]}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grid}>{cells}</View>
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: currentTheme.colors.orange }]} />
        <Text style={[styles.legendText, { color: currentTheme.colors.muted }]}>
          идеальный день — все привычки по плану выполнены
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 14,
    paddingBottom: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: { flex: 1, fontSize: 14, fontWeight: '800', letterSpacing: -0.2, textAlign: 'center' },
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowCol: { flex: 1, alignItems: 'center' },
  dow: { fontSize: 10, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.2857%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 12, fontWeight: '600' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '500', flex: 1 },
});
