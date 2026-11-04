import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { DAYN2 } from '../../utils/text';
import { PlaceholderIcon } from '../ui/PlaceholderIcon';

type Props = {
  value: number[] | null;
  onChange: (days: number[] | null) => void;
};

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export const ScheduleChips: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();

  const toggleDay = (d: number) => {
    let next: number[] | null;
    if (!value) {
      next = [d];
    } else {
      const arr = value.includes(d) ? value.filter((x) => x !== d) : [...value, d];
      next = arr.length === 0 || arr.length === 7 ? null : arr;
    }
    onChange(next);
  };

  return (
    <View style={styles.chips}>
      <TouchableOpacity
        style={[
          styles.chip,
          { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
          value === null && {
            backgroundColor: currentTheme.colors.accent,
            borderColor: currentTheme.colors.accent,
          },
        ]}
        onPress={() => onChange(null)}
        activeOpacity={0.8}
      >
        <PlaceholderIcon name="repeat" size={13} />
        <Text
          style={[
            styles.chipText,
            { color: currentTheme.colors.text },
            value === null && { color: '#fff' },
          ]}
        >
          Каждый день
        </Text>
      </TouchableOpacity>
      {ORDER.map((d) => (
        <TouchableOpacity
          key={d}
          style={[
            styles.chip,
            styles.dayChip,
            { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
            value !== null &&
              value.includes(d) && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
          ]}
          onPress={() => toggleDay(d)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentTheme.colors.text },
              value !== null && value.includes(d) && { color: '#fff' },
            ]}
          >
            {DAYN2[d]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  dayChip: {
    paddingHorizontal: 0,
    width: 42,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
