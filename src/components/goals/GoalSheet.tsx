import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { PlaceholderIcon } from '../ui/PlaceholderIcon';
import { human, rel } from '../../utils/text';

export const GoalSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const addGoal = useAppStore((s) => s.addGoal);
  const { goalSheetVisible, goalRequireDeadline, goalFixedAreaId, closeGoalSheet } = useUiStore();
  const showToast = useToastStore((s) => s.show);
  const [text, setText] = useState('');
  const [crit, setCrit] = useState('');
  const [rew, setRew] = useState('');
  const [pen, setPen] = useState('');
  const [dead, setDead] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [textError, setTextError] = useState(false);
  const [deadError, setDeadError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!goalSheetVisible) return;
    setText('');
    setCrit('');
    setRew('');
    setPen('');
    setDead(null);
    setTextError(false);
    setDeadError(false);
    setShowPicker(false);
    setAreaId(goalFixedAreaId ?? (state.areas.length ? state.areas[0].id : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalSheetVisible, goalFixedAreaId]);

  if (!goalSheetVisible) return null;

  const handlePick = (_e: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      setDead(`${y}-${m}-${d}`);
    }
  };

  const handleSave = () => {
    let err = false;
    if (!text.trim()) {
      setTextError(true);
      setTimeout(() => setTextError(false), 400);
      err = true;
    }
    if (goalRequireDeadline && !dead) {
      setDeadError(true);
      setTimeout(() => setDeadError(false), 400);
      err = true;
    }
    if (err) return;
    if (!areaId) {
      showToast('Выберите сферу');
      return;
    }
    addGoal({
      areaId,
      text: text.trim(),
      crit: crit.trim(),
      rew: rew.trim(),
      pen: pen.trim(),
      dead,
    });
    closeGoalSheet();
    showToast('Цель добавлена');
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={closeGoalSheet}
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
          Новая цель с дедлайном
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: currentTheme.colors.text,
              borderBottomColor: textError ? currentTheme.colors.red : currentTheme.colors.line,
            },
          ]}
          placeholder="Например: Закрыть сессию на 5"
          placeholderTextColor={currentTheme.colors.muted}
          value={text}
          onChangeText={setText}
          maxLength={120}
        />
        {!goalFixedAreaId && (
          <>
            <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Сфера</Text>
            <View style={styles.chips}>
              {state.areas.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.chip,
                    {
                      borderColor: currentTheme.colors.line,
                      backgroundColor: currentTheme.colors.card,
                    },
                    areaId === a.id && {
                      backgroundColor: currentTheme.colors.accent,
                      borderColor: currentTheme.colors.accent,
                    },
                  ]}
                  onPress={() => setAreaId(a.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dot, { backgroundColor: a.color }]} />
                  <Text
                    style={[
                      styles.chipText,
                      { color: currentTheme.colors.text },
                      areaId === a.id && { color: '#fff' },
                    ]}
                  >
                    {a.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>
          Критерий достижения
        </Text>
        <TextInput
          style={[
            styles.subInput,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder="Как пойму, что достиг?"
          placeholderTextColor={currentTheme.colors.muted}
          value={crit}
          onChangeText={setCrit}
          maxLength={120}
        />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Награда</Text>
        <TextInput
          style={[
            styles.subInput,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder="Что будет, если достигну?"
          placeholderTextColor={currentTheme.colors.muted}
          value={rew}
          onChangeText={setRew}
          maxLength={120}
        />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Наказание</Text>
        <TextInput
          style={[
            styles.subInput,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder="Что будет, если нет?"
          placeholderTextColor={currentTheme.colors.muted}
          value={pen}
          onChangeText={setPen}
          maxLength={120}
        />
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Дедлайн</Text>
        <TouchableOpacity
          style={[
            styles.dateBtn,
            { borderColor: deadError ? currentTheme.colors.red : currentTheme.colors.line },
          ]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.8}
        >
          <PlaceholderIcon name="hourglass" size={16} />
          <Text style={{ color: dead ? currentTheme.colors.text : currentTheme.colors.muted }}>
            {dead ? `${human(dead)} · ${rel(dead)}` : 'Выбрать…'}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={dead ? new Date(dead + 'T00:00') : new Date()}
            mode="date"
            display="default"
            onChange={handlePick}
          />
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.buttonAccent, { backgroundColor: currentTheme.colors.accent }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
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
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  chipText: { fontSize: 13, fontWeight: '600' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
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
  buttonText: { fontSize: 15, fontWeight: '700' },
});
