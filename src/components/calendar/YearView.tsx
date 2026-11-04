import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { YearCell } from '../../utils/calendar';

type Props = { cells: YearCell[]; onSelectMonth: (month: number) => void };

export const YearView: React.FC<Props> = ({ cells, onSelectMonth }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={styles.container}>
      {cells.map((cell) => (
        <View key={cell.month} style={styles.monthWrap}>
          <TouchableOpacity
            style={[styles.monthCard, { backgroundColor: currentTheme.colors.card2 }]}
            onPress={() => onSelectMonth(cell.month)}
            activeOpacity={0.7}
          >
            <Text style={[styles.monthName, { color: currentTheme.colors.muted }]}>
              {cell.monthName}
            </Text>
            <View style={styles.daysGrid}>
              {cell.days.map((day, i) =>
                day.day === 0 ? (
                  <View key={i} style={styles.dot} />
                ) : (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      day.hasGoals && { backgroundColor: '#f59e0b' },
                      !day.hasGoals &&
                        day.hasTasks && { backgroundColor: currentTheme.colors.accent },
                    ]}
                  />
                )
              )}
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  monthWrap: { width: '33.333%', padding: 4 },
  monthCard: { flex: 1, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 7 },
  monthName: { fontSize: 10.5, fontWeight: '700', marginBottom: 6 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});

export default YearView;
