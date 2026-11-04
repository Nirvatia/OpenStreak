import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { CalendarView } from '../../utils/calendar';

type Props = { value: CalendarView; onChange: (view: CalendarView) => void };

const OPTIONS: { label: string; value: CalendarView }[] = [
  { label: 'нед', value: 'week' },
  { label: 'мес', value: 'month' },
  { label: 'год', value: 'year' },
];

export const SegmentedControl: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card2 }]}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segment,
            value === opt.value && { backgroundColor: currentTheme.colors.accent },
          ]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              { color: currentTheme.colors.muted },
              value === opt.value && { color: '#fff' },
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 10, padding: 2, gap: 2 },
  segment: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: { fontSize: 11, fontWeight: '700' },
});

export default SegmentedControl;
