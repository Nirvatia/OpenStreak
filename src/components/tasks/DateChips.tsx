import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/themeStore';
import { todayStr, addDays } from '../../utils/text';
import { rel } from '../../utils/dates';

type Props = {
  value: string | null;
  onChange: (date: string | null) => void;
};

export const DateChips: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();
  const [showPicker, setShowPicker] = React.useState(false);

  const today = todayStr();
  const tomorrow = addDays(today, 1);

  const options = [
    { label: 'Сегодня', value: today },
    { label: 'Завтра', value: tomorrow },
    { label: 'Без даты', value: null },
  ];

  const handlePick = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      onChange(dateStr);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.chip,
              { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
              value === opt.value && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[
                styles.chipText,
                { color: currentTheme.colors.text },
                value === opt.value && { color: '#fff' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
            value &&
              value !== today &&
              value !== tomorrow && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
          ]}
          onPress={() => setShowPicker(true)}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentTheme.colors.text },
              value && value !== today && value !== tomorrow && { color: '#fff' },
            ]}
          >
            {value && value !== today && value !== tomorrow ? rel(value) : 'Выбрать…'}
          </Text>
        </TouchableOpacity>
      </View>
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value + 'T00:00') : new Date()}
          mode="date"
          display="default"
          onChange={handlePick}
        />
      )}
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
