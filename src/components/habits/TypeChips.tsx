import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { HabitType } from '../../types/models';

type Props = {
  value: HabitType;
  onChange: (type: HabitType) => void;
};

export const TypeChips: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();

  const options: { label: string; val: HabitType }[] = [
    { label: 'Полезная', val: 'good' },
    { label: 'Вредная', val: 'bad' },
  ];

  return (
    <View style={styles.chips}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.val}
          style={[
            styles.chip,
            { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
            value === opt.val &&
              (opt.val === 'bad'
                ? { backgroundColor: currentTheme.colors.red, borderColor: currentTheme.colors.red }
                : {
                    backgroundColor: currentTheme.colors.accent,
                    borderColor: currentTheme.colors.accent,
                  }),
          ]}
          onPress={() => onChange(opt.val)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentTheme.colors.text },
              value === opt.val && { color: '#fff' },
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
