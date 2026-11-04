import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { WeekCell } from '../../utils/calendar';
import { PRIO_C } from '../../constants/priorities';

type Props = { cells: WeekCell[]; onSelectDate: (date: string) => void };

export const WeekView: React.FC<Props> = ({ cells, onSelectDate }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const bars = cell.tasks
            .slice(0, 4)
            .map((task) =>
              task.done
                ? currentTheme.colors.line
                : PRIO_C[task.priority] || currentTheme.colors.accent
            );
          return (
            <TouchableOpacity
              key={cell.date}
              style={[
                styles.cell,
                { backgroundColor: currentTheme.colors.card2 },
                cell.isSelected && { borderWidth: 2, borderColor: currentTheme.colors.accent },
                cell.hasGoals && { borderWidth: 2, borderColor: '#f59e0b' },
              ]}
              onPress={() => onSelectDate(cell.date)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dow, { color: currentTheme.colors.muted }]}>{cell.dow}</Text>
              <View
                style={[
                  styles.dayNumber,
                  cell.isToday && { backgroundColor: currentTheme.colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: currentTheme.colors.text },
                    cell.isToday && { color: '#fff' },
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
              <View style={styles.bars}>
                {bars.map((color, i) => (
                  <View key={i} style={[styles.bar, { backgroundColor: color }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  grid: { flexDirection: 'row', gap: 4 },
  cell: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    gap: 5,
    minHeight: 88,
  },
  dow: { fontSize: 9.5, fontWeight: '700' },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 12, fontWeight: '700' },
  bars: { width: '100%', minHeight: 20, gap: 3 },
  bar: { height: 4, borderRadius: 2 },
});

export default WeekView;
