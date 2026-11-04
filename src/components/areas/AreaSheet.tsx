import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { HabitIcon } from '../icons/HabitIcon';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';
import { countActiveTasksForArea, countHabitsForArea, countGoalsForArea } from '../../utils/areas';
import { plural } from '../../utils/text';

export const AreaSheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const removeArea = useAppStore((s) => s.removeArea);
  const {
    areasSheetVisible,
    closeAreasSheet,
    openAreaEditSheet,
    setAreaFilter,
    habAreaFilter,
    setHabAreaFilter,
  } = useUiStore();
  const showToast = useToastStore((s) => s.show);
  const [sureId, setSureId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDelete = (areaId: string) => {
    if (sureId === areaId) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setSureId(null);
      removeArea(areaId);
      setAreaFilter(null);
      if (habAreaFilter === areaId) setHabAreaFilter(null);
      showToast('Сфера удалена');
    } else {
      setSureId(areaId);
      showToast('Нажмите ещё раз для удаления');
      timeoutRef.current = setTimeout(() => setSureId(null), 2300);
    }
  };

  if (!areasSheetVisible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={['70%']}
      enablePanDownToClose
      onClose={closeAreasSheet}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Сферы жизни</Text>
        <Text style={[styles.description, { color: currentTheme.colors.muted }]}>
          Сферы группируют задачи и привычки и держат цели перед глазами: учёба, здоровье, работа…
        </Text>
        {state.areas.length === 0 ? (
          <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
            Сфер пока нет — добавьте первую
          </Text>
        ) : (
          state.areas.map((area) => {
            const taskCount = countActiveTasksForArea(area.id, state.tasks);
            const habitCount = countHabitsForArea(area.id, state.habits);
            const { total: goalCount, done: doneGoals } = countGoalsForArea(area);
            return (
              <View
                key={area.id}
                style={[styles.areaItem, { backgroundColor: currentTheme.colors.card2 }]}
              >
                <TouchableOpacity
                  style={styles.areaMain}
                  onPress={() => openAreaEditSheet(area.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.areaIcon, { backgroundColor: area.color }]}>
                    <HabitIcon name={area.icon} size={ICON_SIZES.habit.md} />
                  </View>
                  <View style={styles.areaInfo}>
                    <Text style={[styles.areaName, { color: currentTheme.colors.text }]}>
                      {area.name}
                    </Text>
                    <Text style={[styles.areaStats, { color: currentTheme.colors.muted }]}>
                      {taskCount} {plural(taskCount, 'задача', 'задачи', 'задач')} · {habitCount}{' '}
                      {plural(habitCount, 'привычка', 'привычки', 'привычек')} · целей: {goalCount}
                      {goalCount > 0 ? ` (${doneGoals} ✔)` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    sureId === area.id && { backgroundColor: 'rgba(239, 68, 68, 0.14)' },
                  ]}
                  onPress={() => handleDelete(area.id)}
                  activeOpacity={0.7}
                >
                  <SvgIcon
                    name="trash"
                    size={ICON_SIZES.svg.lg}
                    color={currentTheme.colors.muted}
                  />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentTheme.colors.accent }]}
          onPress={() => openAreaEditSheet(null)}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Добавить сферу</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  areaMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  areaIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaInfo: { flex: 1 },
  areaName: { fontSize: 14.5, fontWeight: '600' },
  areaStats: { fontSize: 12, marginTop: 2 },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
