import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { unitLabel } from '../../utils/habits';

export const ProgressSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const saveHabitProgress = useAppStore((s) => s.saveHabitProgress);
  const { progressHabitId, progressDate, closeProgressSheet } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  const [value, setValue] = useState('0');

  const habit = progressHabitId ? state.habits.find((h) => h.id === progressHabitId) : null;

  useEffect(() => {
    if (!progressHabitId || !progressDate) return;
    const h = useAppStore.getState().state.habits.find((z) => z.id === progressHabitId);
    setValue(String(h ? h.progress[progressDate] || 0 : 0));
  }, [progressHabitId, progressDate]);

  if (!habit || habit.measureType !== 'numeric' || !progressDate) return null;

  const target = habit.target || 1;

  const handleSave = () => {
    const raw = parseInt(value, 10);
    const val = isNaN(raw) ? 0 : Math.max(0, Math.min(target, raw));
    saveHabitProgress({ habitId: habit.id, date: progressDate, value: val });
    closeProgressSheet();
    showToast('Прогресс сохранён');
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={['42%']}
      enablePanDownToClose
      onClose={closeProgressSheet}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Прогресс привычки</Text>
        <Text style={[styles.habitName, { color: currentTheme.colors.muted }]}>{habit.name}</Text>

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Выполнено</Text>
        <TextInput
          style={[
            styles.input,
            { color: currentTheme.colors.text, borderColor: currentTheme.colors.line },
          ]}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          maxLength={4}
        />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Цель на день</Text>
        <Text style={[styles.target, { color: currentTheme.colors.text }]}>
          {target} {unitLabel(habit.unit)}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Сохранить</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  habitName: {
    fontSize: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  input: {
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  target: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
