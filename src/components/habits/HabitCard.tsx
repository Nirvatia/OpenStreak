import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { Habit } from '../../types/models';
import { HabitWeek } from './HabitWeek';
import { SvgIcon } from '../icons/SvgIcon';
import { AppIcon } from '../icons/AppIcon';
import { HabitIcon } from '../icons/HabitIcon';
import { ICON_SIZES } from '../../theme/iconSizes';
import { scheduleLabel, streak, isScheduled, isRest, unitLabel } from '../../utils/habits';
import { plural, todayStr } from '../../utils/text';

type Props = { habit: Habit; compact?: boolean };

export const HabitCard: React.FC<Props> = ({ habit, compact = false }) => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const toggleHabitDate = useAppStore((s) => s.toggleHabitDate);
  const removeHabit = useAppStore((s) => s.removeHabit);
  const { openHabitSheet, openProgressSheet, openRestSheet } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  const [sure, setSure] = useState(false);
  // Тип таймера не из Node: его типы в проект не тянутся, а в RN
  // setTimeout возвращает number. ReturnType работает в обоих случаях.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tb = todayStr();
  const bad = habit.type === 'bad';
  const numeric = habit.measureType === 'numeric';
  const doneT = habit.dates.includes(tb);
  const schedT = isScheduled(habit, tb);
  const restT = isRest(habit, tb);
  const st = streak(habit);
  const prog = habit.progress[tb] || 0;
  const target = numeric ? habit.target || 1 : 1;
  const ul = unitLabel(habit.unit);
  const area = habit.area ? state.areas.find((a) => a.id === habit.area) : null;

  const handleAction = () => {
    if (restT) {
      showToast('Отдых — серия сохраняется');
      return;
    }
    if (!schedT) {
      showToast('Сегодня не по плану');
      return;
    }
    if (numeric) {
      openProgressSheet(habit.id, tb);
      return;
    }
    toggleHabitDate(habit.id, tb);
  };

  const handleDelete = () => {
    if (sure) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setSure(false);
      removeHabit(habit.id);
      showToast('Привычка удалена');
    } else {
      setSure(true);
      showToast('Нажмите ещё раз для удаления');
      timeoutRef.current = setTimeout(() => setSure(false), 2300);
    }
  };

  const actionBorder = restT || !schedT ? currentTheme.colors.line : bad ? '#ef4444' : habit.color;
  const reached = numeric ? prog >= target : doneT;
  const actionBg = reached ? (bad ? '#ef4444' : habit.color) : 'transparent';

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.top}>
        <TouchableOpacity
          style={[styles.emojiBtn, { backgroundColor: habit.color }]}
          onPress={() => openHabitSheet(habit.id)}
          activeOpacity={0.8}
        >
          <HabitIcon name={habit.emoji} size={ICON_SIZES.habit.md} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.info}
          onPress={() => openHabitSheet(habit.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.name, { color: currentTheme.colors.text }]}>
            {habit.name}
            {bad && (
              <Text
                style={[
                  styles.badge,
                  { color: currentTheme.colors.red, backgroundColor: 'rgba(239,68,68,0.12)' },
                ]}
              >
                вредная
              </Text>
            )}
            {restT && (
              <Text
                style={[
                  styles.badge,
                  { color: currentTheme.colors.blue, backgroundColor: 'rgba(59,130,246,0.12)' },
                ]}
              >
                отдых
              </Text>
            )}
          </Text>
          {habit.question ? (
            <Text style={[styles.question, { color: currentTheme.colors.muted }]}>
              «{habit.question}»
            </Text>
          ) : null}
          <Text style={[styles.sub, { color: currentTheme.colors.muted }]} numberOfLines={2}>
            <SvgIcon name="repeat" size={ICON_SIZES.svg.sm} color={habit.color} />
            <Text style={{ color: habit.color, fontWeight: '600' }}> {scheduleLabel(habit)}</Text>
            {area && (
              <>
                <Text> · </Text>
                <HabitIcon name={area.icon} size={ICON_SIZES.habit.xs} />
                <Text style={{ color: area.color, fontWeight: '600' }}> {area.name}</Text>
              </>
            )}
            {habit.remind ? (
              <>
                <Text> · </Text>
                <SvgIcon name="bell" size={ICON_SIZES.svg.sm} color={currentTheme.colors.muted} />
                <Text> {habit.remind}</Text>
              </>
            ) : null}
            <Text> · </Text>
            {restT ? (
              <>
                <HabitIcon name="palm" size={ICON_SIZES.habit.xs} />
                <Text> отдых — серия сохраняется</Text>
              </>
            ) : bad ? (
              st > 0 ? (
                <>
                  <AppIcon name="shield" sizeClass="xs" />
                  <Text>
                    {' '}
                    {st} {plural(st, 'день', 'дня', 'дней')} без срыва
                  </Text>
                </>
              ) : doneT ? (
                <>
                  <AppIcon name="warning" sizeClass="xs" />
                  <Text> сегодня был срыв</Text>
                </>
              ) : (
                <>
                  <AppIcon name="shield" sizeClass="xs" />
                  <Text> без срывов</Text>
                </>
              )
            ) : st > 0 ? (
              <>
                <AppIcon name="fire" sizeClass="xs" />
                <Text>
                  {' '}
                  {st} {plural(st, 'день', 'дня', 'дней')} подряд
                </Text>
              </>
            ) : (
              <Text>{schedT ? 'сегодня по плану' : 'выходной'}</Text>
            )}
            {numeric && !bad ? (
              <Text>
                {' '}
                · цель: {target} {ul}
              </Text>
            ) : null}
            <Text> · </Text>
            {bad ? (
              <Text>
                {habit.dates.length} {plural(habit.dates.length, 'срыв', 'срыва', 'срывов')}
              </Text>
            ) : (
              <Text>{habit.dates.length} всего</Text>
            )}
            {numeric && !bad ? (
              <Text>
                {' '}
                · сегодня: {prog}/{target} {ul}
              </Text>
            ) : null}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.restBtn, restT && { backgroundColor: habit.color + '29', opacity: 1 }]}
          onPress={() => openRestSheet(habit.id)}
          activeOpacity={0.7}
        >
          <HabitIcon name="palm" size={ICON_SIZES.habit.sm} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.delete, sure && { backgroundColor: 'rgba(239, 68, 68, 0.14)' }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <SvgIcon name="trash" size={ICON_SIZES.svg.lg} color={currentTheme.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.action,
            { borderColor: actionBorder, backgroundColor: actionBg },
            (restT || !schedT) && { borderStyle: 'dashed' },
          ]}
          onPress={handleAction}
          activeOpacity={0.8}
        >
          {numeric ? (
            <Text
              style={[
                styles.actionNum,
                { color: reached ? '#fff' : habit.color, opacity: restT || !schedT ? 0.35 : 1 },
              ]}
            >
              {prog}/{target}
            </Text>
          ) : (
            <View style={{ opacity: reached ? 1 : restT || !schedT ? 0.25 : 0.35 }}>
              {bad ? (
                <SvgIcon name="x" size={ICON_SIZES.svg.lg} color={reached ? '#fff' : '#ef4444'} />
              ) : (
                <SvgIcon
                  name="check"
                  size={ICON_SIZES.svg.lg}
                  color={reached ? '#fff' : habit.color}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!compact && <HabitWeek habit={habit} />}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  badge: {
    marginLeft: 6,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  question: { fontSize: 12.5, marginTop: 2, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  restBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.55,
  },
  delete: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.55,
  },
  action: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionNum: { fontSize: 14, fontWeight: '800' },
});
