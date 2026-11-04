import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { human, rel } from '../../utils/text';

export const GoalDetailSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const toggleGoalDone = useAppStore((s) => s.toggleGoalDone);
  const removeGoal = useAppStore((s) => s.removeGoal);
  const { goalDetailAreaId, goalDetailGoalId, closeGoalDetail } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  const area = goalDetailAreaId ? state.areas.find((a) => a.id === goalDetailAreaId) : null;
  const goal = area && goalDetailGoalId ? area.goals.find((g) => g.id === goalDetailGoalId) : null;

  if (!area || !goal) return null;

  const details: { label: string; value: string }[] = [];
  if (goal.crit) details.push({ label: 'Критерий достижения', value: goal.crit });
  if (goal.rew) details.push({ label: 'Награда', value: goal.rew });
  if (goal.pen) details.push({ label: 'Наказание', value: goal.pen });
  if (goal.dead)
    details.push({ label: 'Дедлайн', value: `${human(goal.dead)} (${rel(goal.dead)})` });

  const handleToggle = () => toggleGoalDone({ areaId: area.id, goalId: goal.id });
  const handleDelete = () => {
    removeGoal({ areaId: area.id, goalId: goal.id });
    closeGoalDetail();
    showToast('Цель удалена');
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={['62%']}
      enablePanDownToClose
      onClose={closeGoalDetail}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>{goal.text}</Text>
        <View style={[styles.status, { backgroundColor: currentTheme.colors.card2 }]}>
          <Text
            style={[
              styles.statusText,
              { color: goal.done ? currentTheme.colors.green : currentTheme.colors.muted },
            ]}
          >
            {goal.done ? '✅ Выполнена' : '⏳ В процессе'}
          </Text>
        </View>
        {details.length === 0 ? (
          <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
            Нет дополнительных данных
          </Text>
        ) : (
          details.map((d) => (
            <View
              key={d.label}
              style={[styles.item, { backgroundColor: currentTheme.colors.card2 }]}
            >
              <Text style={[styles.itemLabel, { color: currentTheme.colors.text }]}>{d.label}</Text>
              <Text style={[styles.itemValue, { color: currentTheme.colors.muted }]}>
                {d.value}
              </Text>
            </View>
          ))
        )}
        <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Действия</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.buttonDanger} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={[styles.buttonText, { color: currentTheme.colors.red }]}>Удалить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonAccent, { backgroundColor: currentTheme.colors.accent }]}
            onPress={handleToggle}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {goal.done ? 'Снять отметку' : 'Отметить выполненной'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  status: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: { fontSize: 12.5, fontWeight: '600', textAlign: 'center' },
  item: { borderRadius: 14, padding: 12, marginBottom: 8 },
  itemLabel: { fontSize: 13, fontWeight: '700' },
  itemValue: { fontSize: 13, color: '#7c8698', marginTop: 6, lineHeight: 18 },
  empty: { fontSize: 12.5, paddingVertical: 6 },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginVertical: 9,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  buttonDanger: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.11)',
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
  buttonText: { fontSize: 15, fontWeight: '700' },
});
