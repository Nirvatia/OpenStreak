import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { TaskRow } from '../tasks/TaskRow';
import { tasksOn, goalsOn } from '../../utils/calendar';
import { sortByPriority } from '../../utils/tasks';
import { todayStr, DAYN, human } from '../../utils/text';
import { PlaceholderIcon } from '../ui/PlaceholderIcon';

export const DayPanel: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const openTaskSheet = useUiStore((s) => s.openTaskSheet);
  const areaFilter = useUiStore((s) => s.areaFilter);
  const calSel = useCalendarStore((s) => s.calSel);

  const tb = todayStr();
  const selDate = new Date(calSel + 'T00:00');
  const tasks = sortByPriority(tasksOn(calSel, state.tasks, areaFilter));
  const goals = goalsOn(calSel, state.areas);
  const title = calSel === tb ? 'Сегодня' : `${human(calSel)}, ${DAYN[selDate.getDay()]}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>{title}</Text>
        <View style={[styles.count, { backgroundColor: currentTheme.colors.card2 }]}>
          <Text style={[styles.countText, { color: currentTheme.colors.muted }]}>
            {tasks.length}
          </Text>
        </View>
      </View>

      {goals.map((goal) => {
        const color = goal.area ? goal.area.color : '#f59e0b';
        return (
          <View key={goal.id} style={[styles.goalItem, { backgroundColor: color + '22' }]}>
            <PlaceholderIcon name="flag" size={16} />
            <Text style={[styles.goalText, { color }]} numberOfLines={1}>
              {goal.text}
            </Text>
            {goal.done && <Text style={styles.goalDone}>✓</Text>}
          </View>
        );
      })}

      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}

      {tasks.length === 0 && goals.length === 0 && (
        <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
          На этот день ничего не запланировано
        </Text>
      )}

      <TouchableOpacity
        style={[styles.addButton, { borderColor: currentTheme.colors.line }]}
        onPress={() => openTaskSheet(null, calSel)}
        activeOpacity={0.7}
      >
        <PlaceholderIcon name="plus" size={17} />
        <Text style={[styles.addText, { color: currentTheme.colors.muted }]}>
          Добавить на этот день
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 4,
  },
  title: { fontSize: 13, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  count: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 1 },
  countText: { fontSize: 12, fontWeight: '600' },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
  },
  goalText: { flex: 1, fontSize: 13, fontWeight: '600' },
  goalDone: { fontSize: 16, color: '#1fb876', fontWeight: '700' },
  empty: { fontSize: 12.5, fontWeight: '500', paddingHorizontal: 4, paddingVertical: 10 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 16,
    padding: 15,
    marginTop: 6,
  },
  addText: { fontSize: 14, fontWeight: '600' },
});

export default DayPanel;
