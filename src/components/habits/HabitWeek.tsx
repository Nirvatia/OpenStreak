import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { Habit } from '../../types/models';
import { last7, todayStr, DAYN2 } from '../../utils/text';
import { isScheduled, isRest } from '../../utils/habits';
import { SvgIcon } from '../icons/SvgIcon';
import { AppIcon } from '../icons/AppIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

type Props = { habit: Habit };

export const HabitWeek: React.FC<Props> = ({ habit }) => {
  const { currentTheme } = useThemeStore();
  const toggleHabitDate = useAppStore((s) => s.toggleHabitDate);

  const tb = todayStr();
  const bad = habit.type === 'bad';
  const numeric = habit.measureType === 'numeric';

  const handleTap = (d: string) => {
    if (numeric) return;
    if (isRest(habit, d)) return;
    if (!isScheduled(habit, d)) return;
    toggleHabitDate(habit.id, d);
  };

  return (
    <View style={[styles.row, { borderTopColor: currentTheme.colors.line }]}>
      {last7().map((d) => {
        const isToday = d === tb;
        const sched = isScheduled(habit, d);
        const rest = isRest(habit, d);
        const marked = habit.dates.includes(d);
        const dow = new Date(d + 'T00:00').getDay();

        let circle: any = { borderColor: currentTheme.colors.line };
        let mark: any = null;
        let disabled = false;

        if (rest) {
          circle = {
            borderColor: habit.color,
            borderStyle: 'dashed',
            backgroundColor: currentTheme.colors.card2,
          };
          mark = <AppIcon name="palm" sizeClass="xs" />;
          disabled = true;
        } else if (!sched) {
          circle = { borderColor: currentTheme.colors.line, borderStyle: 'dashed', opacity: 0.35 };
          disabled = true;
        } else if (numeric) {
          if (marked) {
            circle = { backgroundColor: habit.color, borderColor: habit.color };
            mark = <SvgIcon name="check" size={ICON_SIZES.svg.sm} color="#fff" />;
          }
          disabled = true;
        } else if (bad && marked) {
          circle = { backgroundColor: '#ef4444', borderColor: '#ef4444' };
          mark = <SvgIcon name="x" size={ICON_SIZES.svg.sm} color="#fff" />;
        } else if (bad && !marked && d < tb) {
          circle = {
            borderColor: 'rgba(31,184,118,0.55)',
            backgroundColor: 'rgba(31,184,118,0.13)',
          };
          mark = <SvgIcon name="check" size={ICON_SIZES.svg.sm} color="#1fb876" />;
        } else if (!bad && marked) {
          circle = { backgroundColor: habit.color, borderColor: habit.color };
          mark = <SvgIcon name="check" size={ICON_SIZES.svg.sm} color="#fff" />;
        }

        if (isToday) {
          circle.borderColor = rest ? habit.color : sched ? habit.color : circle.borderColor;
        }

        return (
          <TouchableOpacity
            key={d}
            style={styles.cell}
            onPress={() => handleTap(d)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.circle,
                circle,
                isToday && {
                  shadowColor: habit.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 4,
                },
              ]}
            >
              {mark}
            </View>
            <Text
              style={[
                styles.dow,
                { color: currentTheme.colors.muted, opacity: !sched && !rest ? 0.4 : 1 },
              ]}
            >
              {DAYN2[dow]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 4,
  },
  cell: { alignItems: 'center', gap: 6 },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dow: { fontSize: 10.5, fontWeight: '600' },
});
