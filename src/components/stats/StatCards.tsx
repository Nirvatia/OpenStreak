import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { last7, activityPerDay, perfectStreak } from '../../utils/stats';
import { plural } from '../../utils/text';
import { SvgIcon } from '../icons/SvgIcon';
import { AppIcon } from '../icons/AppIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

export const StatCards: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const days = last7();

  const weekTasks = state.tasks.filter((task) => task.doneAt && days.includes(task.doneAt)).length;
  const totalActivity = days.reduce(
    (sum, date) => sum + activityPerDay(date, state.tasks, state.habits),
    0
  );
  const weekHabits = totalActivity - weekTasks;
  const pf = perfectStreak(state.habits, state.startedAt);
  const totalTasks = state.tasks.filter((task) => task.done).length;

  return (
    <View style={styles.grid}>
      <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(31,184,118,0.14)' }]}>
          <SvgIcon name="check" size={ICON_SIZES.svg.lg} color="#1fb876" />
        </View>
        <Text style={[styles.value, { color: currentTheme.colors.text }]}>{weekTasks}</Text>
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>задач за неделю</Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(47,124,246,0.14)' }]}>
          <SvgIcon name="repeat" size={ICON_SIZES.svg.lg} color="#2f7cf6" />
        </View>
        <Text style={[styles.value, { color: currentTheme.colors.text }]}>{weekHabits}</Text>
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>отметок привычек</Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(245,158,11,0.16)' }]}>
          <AppIcon name="star" sizeClass="sm" />
        </View>
        <Text style={[styles.value, { color: currentTheme.colors.text }]}>{pf}</Text>
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          {plural(pf, 'идеальный день', 'идеальных дня', 'идеальных дней')} подряд
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(168,85,247,0.14)' }]}>
          <SvgIcon name="note" size={ICON_SIZES.svg.lg} color="#a855f7" />
        </View>
        <Text style={[styles.value, { color: currentTheme.colors.text }]}>{totalTasks}</Text>
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>задач за всё время</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  card: {
    width: '48.5%',
    borderRadius: 18,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
