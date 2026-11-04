import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/themeStore';
import { SvgIcon } from '../icons/SvgIcon';

type Props = { value: string; onChange: (time: string) => void };

export const RemindField: React.FC<Props> = ({ value, onChange }) => {
  const { currentTheme } = useThemeStore();
  const [showPicker, setShowPicker] = useState(false);

  const handlePick = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
  };

  const handleClear = () => onChange('');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.line },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <SvgIcon name="bell" size={20} color={currentTheme.colors.muted} />
        <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
          {value || 'Не напоминать'}
        </Text>
        {value ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <SvgIcon name="close" size={18} color={currentTheme.colors.muted} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(`2000-01-01T${value}`) : new Date()}
          mode="time"
          display="default"
          onChange={handlePick}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
  },
  buttonText: { flex: 1, fontSize: 15, fontWeight: '500' },
  clearButton: { padding: 4 },
});
