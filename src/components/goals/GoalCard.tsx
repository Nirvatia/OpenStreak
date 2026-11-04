import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { SvgIcon } from '../icons/SvgIcon';
import { HabitIcon } from '../icons/HabitIcon';
import { ICON_SIZES } from '../../theme/iconSizes';
import { GoalWithArea, daysToGoal } from '../../utils/goals';
import { plural, todayStr } from '../../utils/text';

type Props = { goal: GoalWithArea };

export const GoalCard: React.FC<Props> = ({ goal }) => {
  const { currentTheme } = useThemeStore();
  const removeGoal = useAppStore((s) => s.removeGoal);
  const openGoalDetail = useUiStore((s) => s.openGoalDetail);
  const showToast = useToastStore((s) => s.show);
  const left = daysToGoal(goal.dead || todayStr());
  const late = left < 0;
  const isToday = goal.dead === todayStr();

  const open = () => openGoalDetail(goal.area.id, goal.id);
  const handleDelete = () => {
    removeGoal({ areaId: goal.area.id, goalId: goal.id });
    showToast('Цель удалена');
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: currentTheme.colors.card },
        isToday && { borderWidth: 2, borderColor: currentTheme.colors.accent },
      ]}
    >
      <TouchableOpacity
        style={[styles.emoji, { backgroundColor: goal.area.color }]}
        onPress={open}
        activeOpacity={0.8}
      >
        <HabitIcon name={goal.area.icon} size={ICON_SIZES.habit.md} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.info} onPress={open} activeOpacity={0.7}>
        <Text style={[styles.name, { color: currentTheme.colors.text }]} numberOfLines={2}>
          {goal.text}
        </Text>
        <Text style={[styles.sub, { color: goal.area.color }]}>{goal.area.name}</Text>
      </TouchableOpacity>
      <View style={styles.leftCol}>
        <Text style={[styles.leftNum, { color: currentTheme.colors.text }]}>
          {late ? Math.abs(left) : left}
        </Text>
        <Text
          style={[
            styles.leftLbl,
            { color: late ? currentTheme.colors.red : currentTheme.colors.muted },
          ]}
        >
          {late ? 'проср.' : plural(left, 'день', 'дня', 'дней')}
        </Text>
      </View>
      <TouchableOpacity style={styles.del} onPress={handleDelete} activeOpacity={0.7}>
        <SvgIcon name="trash" size={ICON_SIZES.svg.lg} color={currentTheme.colors.muted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  emoji: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 14.5 },
  sub: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  leftCol: { alignItems: 'flex-end' },
  leftNum: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  leftLbl: { fontSize: 11, fontWeight: '500' },
  del: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.55,
  },
});
