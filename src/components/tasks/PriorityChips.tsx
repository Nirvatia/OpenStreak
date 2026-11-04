import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Priority } from '../../types/models';
import { PRIO_C, PRIO_N } from '../../constants/priorities';

type Props = {
  value: Priority;
  onChange: (priority: Priority) => void;
};

export const PriorityChips: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {PRIO_N.map((label, idx) => {
          const priority = idx as Priority;
          const isActive = value === priority;
          const color = PRIO_C[idx];

          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.chip,
                {
                  borderColor: currentTheme.colors.line,
                  backgroundColor: currentTheme.colors.card,
                },
                isActive && {
                  backgroundColor: currentTheme.colors.accent,
                  borderColor: currentTheme.colors.accent,
                },
              ]}
              onPress={() => onChange(priority)}
            >
              {color && <View style={[styles.dot, { backgroundColor: color }]} />}
              <Text
                style={[
                  styles.chipText,
                  { color: currentTheme.colors.text },
                  isActive && { color: '#fff' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
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
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
