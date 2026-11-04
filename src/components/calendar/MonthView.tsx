import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { MonthCell } from '../../utils/calendar';
import { PRIO_C } from '../../constants/priorities';

type Props = { cells: MonthCell[]; onSelectDate: (date: string) => void };

const DOW = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export const MonthView: React.FC<Props> = ({ cells, onSelectDate }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={styles.container}>
      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={[styles.dow, { color: currentTheme.colors.muted }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const bars = cell.tasks
            .slice(0, 3)
            .map((task) =>
              task.done
                ? currentTheme.colors.line
                : PRIO_C[task.priority] || currentTheme.colors.accent
            );
          const more = cell.tasks.length > 3 ? cell.tasks.length - 3 : 0;
          return (
            <View key={cell.date} style={styles.cellWrap}>
              <TouchableOpacity
                style={[
                  styles.cell,
                  cell.isSelected && { backgroundColor: currentTheme.colors.accentSoft },
                ]}
                onPress={() => onSelectDate(cell.date)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dayNumber,
                    cell.isToday && { backgroundColor: currentTheme.colors.accent },
                    cell.hasGoals && { borderWidth: 2, borderColor: '#f59e0b' },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: currentTheme.colors.text },
                      cell.isOtherMonth && { color: currentTheme.colors.muted, opacity: 0.4 },
                      cell.isToday && { color: '#fff' },
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
                <View style={[styles.bars, cell.isOtherMonth && { opacity: 0.4 }]}>
                  {bars.map((color, i) => (
                    <View key={i} style={[styles.bar, { backgroundColor: color }]} />
                  ))}
                  {more > 0 && (
                    <Text style={[styles.more, { color: currentTheme.colors.muted }]}>+{more}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: { width: '14.2857%', textAlign: 'center', fontSize: 10, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { width: '14.2857%', padding: 1 },
  cell: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    gap: 3,
    minHeight: 48,
  },
  dayNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 11.5, fontWeight: '600' },
  bars: { width: '72%', gap: 2, alignItems: 'stretch', minHeight: 4 },
  bar: { height: 3, borderRadius: 2 },
  more: { fontSize: 8, color: '#7c8698', lineHeight: 9 },
});

export default MonthView;
