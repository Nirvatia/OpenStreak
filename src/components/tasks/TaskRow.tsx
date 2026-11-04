import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { SvgIcon } from '../icons/SvgIcon';
import { HabitIcon } from '../icons/HabitIcon';
import { ICON_SIZES } from '../../theme/iconSizes';
import { Task } from '../../types/models';
import { rel } from '../../utils/dates';
import { isOverdue } from '../../utils/tasks';
import { PRIO_C, PRIO_N } from '../../constants/priorities';

type Props = { task: Task };

export const TaskRow: React.FC<Props> = ({ task }) => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const openTaskSheet = useUiStore((s) => s.openTaskSheet);
  const showToast = useToastStore((s) => s.show);
  const [sure, setSure] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const area = task.area ? state.areas.find((a) => a.id === task.area) : null;
  const taskColor = area ? area.color : currentTheme.colors.accent;
  const overdue = isOverdue(task);
  const prioColor = PRIO_C[task.priority];

  const handleDelete = () => {
    if (sure) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setSure(false);
      removeTask(task.id);
      showToast('Задача удалена');
    } else {
      setSure(true);
      showToast('Нажмите ещё раз для удаления');
      timeoutRef.current = setTimeout(() => setSure(false), 2300);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 10,
      onPanResponderMove: (_e, gs) => {
        if (gs.dx < 0) translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_e, gs) => {
        if (gs.dx < -90) {
          Animated.timing(translateX, {
            toValue: -1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            removeTask(task.id);
            showToast('Задача удалена');
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.swipeBg, { backgroundColor: '#ef4444' }]}>
        <SvgIcon name="trash" size={ICON_SIZES.svg.lg} color="#fff" />
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          { backgroundColor: currentTheme.colors.card, transform: [{ translateX }] },
        ]}
      >
        <TouchableOpacity
          style={styles.check}
          onPress={() => toggleTask(task.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: task.done ? taskColor : '#b9c3d2',
                backgroundColor: task.done ? taskColor : 'transparent',
              },
            ]}
          >
            {task.done && <SvgIcon name="check" size={ICON_SIZES.svg.sm} color="#fff" />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.body}
          onPress={() => openTaskSheet(task.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.title,
              { color: task.done ? currentTheme.colors.muted : currentTheme.colors.text },
              task.done && styles.titleDone,
            ]}
          >
            {task.title}
          </Text>
          <View style={styles.meta}>
            {area && (
              <View style={styles.metaItem}>
                <HabitIcon name={area.icon} size={ICON_SIZES.habit.xs} />
                <Text style={[styles.metaText, { color: taskColor }]}>{area.name}</Text>
              </View>
            )}
            {task.date && (
              <View style={styles.metaItem}>
                <SvgIcon
                  name="cal"
                  size={ICON_SIZES.svg.sm}
                  color={overdue ? currentTheme.colors.red : currentTheme.colors.muted}
                />
                <Text style={[styles.metaText, overdue && { color: currentTheme.colors.red }]}>
                  {rel(task.date)}
                </Text>
              </View>
            )}
            {task.priority > 0 && (
              <View style={styles.metaItem}>
                <SvgIcon name="flag" size={ICON_SIZES.svg.sm} color={prioColor} />
                <Text style={[styles.metaText, { color: prioColor }]}>{PRIO_N[task.priority]}</Text>
              </View>
            )}
            {task.remind && (
              <View style={styles.metaItem}>
                <SvgIcon name="bell" size={ICON_SIZES.svg.sm} color={currentTheme.colors.muted} />
                <Text style={styles.metaText}>{task.remind}</Text>
              </View>
            )}
            {task.notes ? (
              <View style={styles.metaItem}>
                <SvgIcon name="note" size={ICON_SIZES.svg.sm} color={currentTheme.colors.muted} />
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.delete, sure && { backgroundColor: 'rgba(239, 68, 68, 0.14)' }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <SvgIcon name="trash" size={ICON_SIZES.svg.lg} color={currentTheme.colors.muted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 9, borderRadius: 15, overflow: 'hidden' },
  swipeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 22,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  check: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { flex: 1, marginHorizontal: 8 },
  title: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  titleDone: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12.5, fontWeight: '500', color: '#7c8698' },
  delete: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TaskRow;
