import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { Priority } from '../../types/models';
import { DateChips } from './DateChips';
import { PriorityChips } from './PriorityChips';
import { RemindField } from './RemindField';

export const TaskSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const saveTask = useAppStore((s) => s.saveTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const { taskSheetVisible, editingTaskId, closeTaskSheet, areaFilter } = useUiStore();
  const taskSheetPresetDate = useUiStore((s) => s.taskSheetPresetDate);
  const showToast = useToastStore((s) => s.show);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(0);
  const [remind, setRemind] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [titleError, setTitleError] = useState(false);
  const editingTask = editingTaskId ? state.tasks.find((t) => t.id === editingTaskId) : null;

  useEffect(() => {
    if (!taskSheetVisible) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setNotes(editingTask.notes);
      setDate(editingTask.date);
      setPriority(editingTask.priority);
      setRemind(editingTask.remind);
      setArea(editingTask.area);
    } else {
      setTitle('');
      setNotes('');
      setDate(taskSheetPresetDate);
      setPriority(0);
      setRemind('');
      setArea(areaFilter);
    }
    setTitleError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskSheetVisible, editingTaskId]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError(true);
      setTimeout(() => setTitleError(false), 400);
      return;
    }
    saveTask({
      id: editingTask?.id,
      title: trimmedTitle,
      notes: notes.trim(),
      date,
      priority,
      remind,
      area,
    });
    closeTaskSheet();
    showToast('Сохранено');
  };

  const handleDelete = () => {
    if (editingTaskId) {
      removeTask(editingTaskId);
      closeTaskSheet();
      showToast('Задача удалена');
    }
  };

  if (!taskSheetVisible) return null;
  return (
    <BottomSheet
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={closeTaskSheet}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          {editingTask ? 'Задача' : 'Новая задача'}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: currentTheme.colors.text,
              borderBottomColor: titleError ? currentTheme.colors.red : currentTheme.colors.line,
            },
          ]}
          placeholder="Что нужно сделать?"
          placeholderTextColor={currentTheme.colors.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        <TextInput
          style={[
            styles.textarea,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder="Заметка (необязательно)"
          placeholderTextColor={currentTheme.colors.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Сфера</Text>
        <View style={styles.areaChips}>
          <TouchableOpacity
            style={[
              styles.areaChip,
              { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
              area === null && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
            ]}
            onPress={() => setArea(null)}
          >
            <Text
              style={[
                styles.areaChipText,
                { color: currentTheme.colors.text },
                area === null && { color: '#fff' },
              ]}
            >
              Без сферы
            </Text>
          </TouchableOpacity>
          {state.areas.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[
                styles.areaChip,
                {
                  borderColor: currentTheme.colors.line,
                  backgroundColor: currentTheme.colors.card,
                },
                area === a.id && { backgroundColor: a.color, borderColor: a.color },
              ]}
              onPress={() => setArea(a.id)}
            >
              <View style={[styles.areaDot, { backgroundColor: a.color }]} />
              <Text
                style={[
                  styles.areaChipText,
                  { color: currentTheme.colors.text },
                  area === a.id && { color: '#fff' },
                ]}
              >
                {a.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Дата</Text>
        <DateChips value={date} onChange={setDate} />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Приоритет</Text>
        <PriorityChips value={priority} onChange={setPriority} />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          Напоминание (необязательно)
        </Text>
        <RemindField value={remind} onChange={setRemind} />
        <View style={styles.actions}>
          {editingTask && (
            <TouchableOpacity style={styles.buttonDanger} onPress={handleDelete}>
              <Text style={[styles.buttonText, { color: currentTheme.colors.red }]}>Удалить</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.buttonAccent, { backgroundColor: currentTheme.colors.accent }]}
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: 6,
  },
  textarea: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    minHeight: 60,
    marginBottom: 16,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  areaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  areaDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  areaChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  buttonAccent: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonDanger: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.11)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
