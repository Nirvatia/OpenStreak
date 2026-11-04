import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { HabitType, MeasureType, HabitUnit } from '../../types/models';
import { TypeChips } from './TypeChips';
import { MeasureChips } from './MeasureChips';
import { UnitChips } from './UnitChips';
import { ScheduleChips } from './ScheduleChips';
import { EmojiGrid } from './EmojiGrid';
import { ColorPicker } from '../areas/ColorPicker';
import { RemindField } from '../tasks/RemindField';
import { COLORS } from '../../constants/colors';

export const HabitSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);
  const removeHabit = useAppStore((s) => s.removeHabit);
  const { habitSheetVisible, editingHabitId, closeHabitSheet, habAreaFilter } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('good');
  const [measureType, setMeasureType] = useState<MeasureType>('boolean');
  const [unit, setUnit] = useState<HabitUnit>('count');
  const [target, setTarget] = useState('1');
  const [question, setQuestion] = useState('');
  const [emoji, setEmoji] = useState('drop');
  const [color, setColor] = useState(COLORS[0]);
  const [days, setDays] = useState<number[] | null>(null);
  const [remind, setRemind] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [targetError, setTargetError] = useState(false);

  const editingHabit = editingHabitId ? state.habits.find((h) => h.id === editingHabitId) : null;

  useEffect(() => {
    if (!habitSheetVisible) return;
    if (editingHabit) {
      setName(editingHabit.name);
      setType(editingHabit.type);
      setMeasureType(editingHabit.measureType);
      setUnit(editingHabit.unit);
      setTarget(String(editingHabit.target || 1));
      setQuestion(editingHabit.question);
      setEmoji(editingHabit.emoji);
      setColor(editingHabit.color);
      setDays(editingHabit.days);
      setRemind(editingHabit.remind);
      setArea(editingHabit.area);
    } else {
      setName('');
      setType('good');
      setMeasureType('boolean');
      setUnit('count');
      setTarget('1');
      setQuestion('');
      setEmoji('drop');
      setColor(COLORS[0]);
      setDays(null);
      setRemind('');
      setArea(habAreaFilter);
    }
    setNameError(false);
    setTargetError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitSheetVisible, editingHabitId]);

  const handleSelectArea = (areaId: string | null) => {
    setArea(areaId);
    if (areaId) {
      const found = state.areas.find((a) => a.id === areaId);
      if (found) setColor(found.color);
    }
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      setTimeout(() => setNameError(false), 400);
      return;
    }

    let targetNum = 1;
    if (measureType === 'numeric') {
      const parsed = parseInt(target, 10);
      targetNum = isNaN(parsed) ? 0 : parsed;
      if (targetNum < 1) {
        setTargetError(true);
        setTimeout(() => setTargetError(false), 400);
        return;
      }
    }

    const input = {
      name: trimmed,
      type,
      question: question.trim(),
      emoji,
      color,
      days,
      remind,
      area,
      measureType,
      unit: measureType === 'numeric' ? unit : ('count' as HabitUnit),
      target: measureType === 'numeric' ? targetNum : 1,
    };

    if (editingHabitId) {
      updateHabit(editingHabitId, input);
    } else {
      addHabit(input);
    }

    closeHabitSheet();
    showToast('Сохранено');
  };

  const handleDelete = () => {
    if (editingHabitId) {
      removeHabit(editingHabitId);
      closeHabitSheet();
      showToast('Привычка удалена');
    }
  };

  if (!habitSheetVisible) return null;

  const questionPlaceholder =
    type === 'good' ? 'Например: Ты тренировался сегодня?' : 'Например: Смотрел TikTok сегодня?';

  return (
    <BottomSheet
      index={0}
      snapPoints={['88%']}
      enablePanDownToClose
      onClose={closeHabitSheet}
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
          {editingHabit ? 'Привычка' : 'Новая привычка'}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: currentTheme.colors.text,
              borderBottomColor: nameError ? currentTheme.colors.red : currentTheme.colors.line,
            },
          ]}
          placeholder="Например: пить воду"
          placeholderTextColor={currentTheme.colors.muted}
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Тип</Text>
        <TypeChips value={type} onChange={setType} />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Измерение</Text>
        <MeasureChips value={measureType} onChange={setMeasureType} />

        {measureType === 'numeric' && (
          <View>
            <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
              Единица измерения
            </Text>
            <UnitChips value={unit} onChange={setUnit} />

            <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Цель на день</Text>
            <TextInput
              style={[
                styles.targetInput,
                {
                  color: currentTheme.colors.text,
                  borderColor: targetError ? currentTheme.colors.red : currentTheme.colors.line,
                },
              ]}
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        )}

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Сфера</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[
              styles.chip,
              { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
              area === null && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
            ]}
            onPress={() => handleSelectArea(null)}
          >
            <Text
              style={[
                styles.chipText,
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
                styles.chip,
                {
                  borderColor: currentTheme.colors.line,
                  backgroundColor: currentTheme.colors.card,
                },
                area === a.id && { backgroundColor: a.color, borderColor: a.color },
              ]}
              onPress={() => handleSelectArea(a.id)}
            >
              <View style={[styles.dot, { backgroundColor: a.color }]} />
              <Text
                style={[
                  styles.chipText,
                  { color: currentTheme.colors.text },
                  area === a.id && { color: '#fff' },
                ]}
              >
                {a.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Повторение</Text>
        <ScheduleChips value={days} onChange={setDays} />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          Вопрос для самопроверки
        </Text>
        <TextInput
          style={[
            styles.subInput,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder={questionPlaceholder}
          placeholderTextColor={currentTheme.colors.muted}
          value={question}
          onChangeText={setQuestion}
          maxLength={80}
        />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          Напоминание (необязательно)
        </Text>
        <RemindField value={remind} onChange={setRemind} />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Иконка</Text>
        <EmojiGrid selected={emoji} onSelect={setEmoji} />

        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Цвет</Text>
        <ColorPicker selectedColor={color} onSelect={setColor} />

        <View style={styles.actions}>
          {editingHabit && (
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
  subInput: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  targetInput: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
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
