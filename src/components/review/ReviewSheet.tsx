import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { MoodPicker } from './MoodPicker';
import { isScheduled, isRest } from '../../utils/habits';
import { isPerfect } from '../../utils/moods';
import { sortByPriority } from '../../utils/tasks';

export const ReviewSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const saveReview = useAppStore((s) => s.saveReview);
  const { reviewDate, closeReview } = useUiStore();
  const showToast = useToastStore((s) => s.show);
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!reviewDate) return;
    const cur = state.moods[reviewDate];
    setMood(cur ? cur.mood : 0);
    setNote(cur ? cur.note || '' : '');
  }, [reviewDate, state.moods]);

  if (!reviewDate) return null;

  const tb = reviewDate;
  const scope = state.tasks.filter((x) => x.date === tb);
  const done = scope.filter((x) => x.done).length;
  const scheduled = state.habits.filter((h) => isScheduled(h, tb) && !isRest(h, tb));
  const ok = scheduled.filter((h) =>
    h.type === 'bad' ? !h.dates.includes(tb) : h.dates.includes(tb)
  ).length;
  const perfect = isPerfect(tb, state.habits, state.startedAt);

  const handleSave = () => {
    if (!mood) {
      showToast('Выберите настроение');
      return;
    }
    saveReview({ date: tb, mood, note });
    closeReview();
    showToast('Обзор сохранён ✨');
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={closeReview}
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
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Вечерний обзор</Text>

        {/* Сводка */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: currentTheme.colors.card2 }]}>
            <Text style={[styles.summaryText, { color: currentTheme.colors.muted }]}>
              Задачи{' '}
              <Text style={{ color: currentTheme.colors.text, fontWeight: '700' }}>
                {done}/{scope.length}
              </Text>
            </Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: currentTheme.colors.card2 }]}>
            <Text style={[styles.summaryText, { color: currentTheme.colors.muted }]}>
              Привычки{' '}
              <Text style={{ color: currentTheme.colors.text, fontWeight: '700' }}>
                {ok}/{scheduled.length}
              </Text>
            </Text>
          </View>
          {perfect && (
            <View style={[styles.summaryChip, { backgroundColor: currentTheme.colors.card2 }]}>
              <Text style={[styles.summaryText, { color: currentTheme.colors.muted }]}>
                🌟{' '}
                <Text style={{ color: currentTheme.colors.text, fontWeight: '700' }}>
                  идеальный день
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Детали задач */}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Задачи</Text>
        {scope.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>
            Нет задач на этот день
          </Text>
        ) : (
          sortByPriority(scope).map((task) => (
            <View key={task.id} style={styles.itemRow}>
              <View
                style={[
                  styles.itemIcon,
                  {
                    backgroundColor: task.done
                      ? currentTheme.colors.green
                      : currentTheme.colors.line,
                  },
                ]}
              >
                {task.done ? <Text style={styles.itemIconText}>✓</Text> : null}
              </View>
              <Text
                style={[
                  styles.itemText,
                  { color: task.done ? currentTheme.colors.muted : currentTheme.colors.text },
                  task.done && styles.itemTextDone,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
            </View>
          ))
        )}

        {/* Детали привычек */}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Привычки</Text>
        {scheduled.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.colors.muted }]}>
            Нет привычек по плану
          </Text>
        ) : (
          scheduled.map((h) => {
            const doneH = h.type === 'bad' ? !h.dates.includes(tb) : h.dates.includes(tb);
            return (
              <View key={h.id} style={styles.itemRow}>
                <View
                  style={[
                    styles.itemIcon,
                    {
                      backgroundColor: doneH ? currentTheme.colors.green : currentTheme.colors.line,
                    },
                  ]}
                >
                  {doneH ? <Text style={styles.itemIconText}>✓</Text> : null}
                </View>
                <Text
                  style={[
                    styles.itemText,
                    {
                      flex: 1,
                      color: doneH ? currentTheme.colors.muted : currentTheme.colors.text,
                    },
                    doneH && styles.itemTextDone,
                  ]}
                  numberOfLines={2}
                >
                  {h.name}
                </Text>
                {h.type === 'bad' && (
                  <Text
                    style={[
                      styles.badBadge,
                      {
                        color: currentTheme.colors.red,
                        backgroundColor: 'rgba(239,68,68,0.12)',
                      },
                    ]}
                  >
                    вредная
                  </Text>
                )}
              </View>
            );
          })
        )}

        {/* Настроение */}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Настроение за день</Text>
        <MoodPicker selected={mood} onSelect={setMood} />

        {/* Дневник */}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Дневник</Text>
        <TextInput
          style={[
            styles.textarea,
            { color: currentTheme.colors.text, borderBottomColor: currentTheme.colors.line },
          ]}
          placeholder="Пара строк о том, как прошёл день…"
          placeholderTextColor={currentTheme.colors.muted}
          value={note}
          onChangeText={setNote}
          multiline
          textAlignVertical="top"
        />

        {/* Сохранить */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Сохранить</Text>
        </TouchableOpacity>
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
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  summaryChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  emptyText: {
    fontSize: 12.5,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  itemIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemText: {
    fontSize: 14,
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
  },
  badBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  textarea: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    minHeight: 70,
    marginBottom: 8,
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
