/**
 * Карточка привычки (design/mult/M-Habit): плитка и название, луна сегодняшнего дня с «+N»
 * (или «Отметить»), серия зарубками, последние 4 недели лунами, «Выходной» и «Слил сегодня».
 * Для вредной привычки вместо «слил» — «Сорвался».
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { vibrateImpact } from '../../services/haptics';
import { addDays, startOfWeek } from '../../core/dates';
import { dataOf, fullValue, habitDay, habitDays, habitStats, indexHabits } from '../../core/habits';
import { settingsOf } from '../../core/settings';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette, usePlain } from '../../store/themeStore';
import { PlainMark } from '../../ui/PlainMark';
import { RADIUS, SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button, IconButton } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { IconTile } from '../../ui/icons';
import { Moon } from '../../ui/Moon';
import { Notches } from '../../ui/Notches';
import { Card } from '../../ui/Sticker';
import { useToast } from '../../ui/toast';
import { MoonGrid } from '../../ui/WeekMoons';
import { useNewSheet } from '../new/newSheetStore';
import { dayState, scheduleLabel, targetLabel } from './habitText';

/** Шаги «+N» для числовой привычки: 10, 20 и 40 % нормы, без повторов. */
function steps(target: number): number[] {
  return [...new Set([0.1, 0.2, 0.4].map((k) => Math.max(1, Math.round(target * k))))];
}

export function HabitScreen({ habitId, onBack }: { habitId: string; onBack: () => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const plain = usePlain();
  const toast = useToast((s) => s.show);
  const editHabit = useNewSheet((s) => s.editHabit);
  const { weekStart } = settingsOf(data);
  const h = data.habits[habitId];

  const view = useMemo(() => {
    if (!h || h.deletedAt !== null) return null;
    const hd = dataOf(indexHabits(data), h.id);
    const from = addDays(startOfWeek(today, weekStart), -21);
    const month = habitDays(h, hd, from, addDays(from, 27), today);
    return {
      day: habitDay(h, hd, today, today),
      stats: habitStats(h, hd, today),
      month: month.map((d) => ({ state: dayState(d, h, today), part: d.fraction })),
    };
  }, [data, h, today, weekStart]);

  if (!h || !view) return null;
  const { day, stats } = view;
  const bad = h.kind === 'bad';
  const numeric = !bad && h.measure === 'numeric';
  const full = fullValue(h);
  const value = day.value;
  const rest = day.mark === 'rest';
  const slip = day.mark === 'slip';

  const status = bad
    ? t(slip ? 'habit.slippedToday' : rest ? 'habit.restToday' : 'habit.cleanToday')
    : slip
      ? t('habit.slippedToday')
      : rest
        ? t('habit.restToday')
        : numeric
          ? value >= full
            ? t('habit.full')
            : t('habit.left', { left: full - value })
          : day.mark === 'full'
            ? t('habit.doneToday')
            : t('habit.notYet');

  const meta = [
    bad ? scheduleLabel(t, h.days, weekStart) : targetLabel(t, h, weekStart),
    numeric ? scheduleLabel(t, h.days, weekStart) : null,
    h.remindAt ? t('habits.remind', { time: h.remindAt }) : null,
  ]
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .join(' · ');

  const toggleSlip = () => {
    if (bad) A.toggleCheck(h.id, today);
    else A.toggleSlip(h.id, today);
    if (!slip) {
      // Отмена возвращает день как был: отметку (с её значением) или пустой день.
      const before = value;
      toast(t('toast.streakLost'), {
        label: t('common.undo'),
        onPress: () => {
          if (bad) A.toggleCheck(h.id, today);
          else if (before > 0) A.setCheckValue(h.id, today, before);
          else A.toggleSlip(h.id, today);
        },
      });
    }
  };
  const toggleRest = () => {
    A.toggleRestDay(h.id, today);
    if (!rest) toast(t('toast.habitRest'));
  };

  const weekdays = Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACE.sm, paddingBottom: insets.bottom + SPACE.xl },
      ]}
    >
      <View style={styles.top}>
        <IconButton icon="back" label={t('common.back')} onPress={onBack} />
        <Chip label={t('habit.edit')} onPress={() => editHabit(h.id)} />
      </View>

      <View style={styles.title}>
        {!plain && <IconTile icon={h.icon} size={52} tilt={-4} />}
        <View style={styles.titles}>
          <Text accessibilityRole="header" style={[TYPE.heading, { color: p.text }]}>
            {h.name}
          </Text>
          {!!meta && <Text style={[TYPE.meta, { color: p.muted }]}>{meta}</Text>}
        </View>
      </View>

      <Card radius={RADIUS.xl} style={styles.progress}>
        <View style={styles.progressRow}>
          {plain ? (
            <PlainMark
              shape="square"
              size={56}
              fill={slip ? 0 : bad ? (rest ? 0 : 1) : day.fraction}
              debt={slip}
            />
          ) : (
            <Moon
              phase={slip ? 1 : bad ? (rest ? 0 : 1) : day.fraction}
              tone={slip ? 'red' : 'sun'}
              ring={slip ? 'red' : rest ? 'muted' : 'ring'}
              dashed={rest && !slip}
              size={84}
            />
          )}
          <View style={styles.score}>
            {numeric ? (
              <Text
                style={[TYPE.numberScore, { color: p.text }]}
                accessibilityLabel={t('habit.ofTarget', { value, target: full })}
              >
                {value}
                <Text style={[TYPE.numberScoreLight, { color: p.muted }]}>
                  {' / '}
                  {full}
                </Text>
              </Text>
            ) : null}
            <Text
              style={[numeric ? TYPE.note : TYPE.itemStrong, { color: numeric ? p.muted : p.text }]}
            >
              {status}
            </Text>
          </View>
        </View>
        {!bad && !slip && (
          <View style={styles.adds}>
            {numeric ? (
              value >= full ? (
                <Button
                  label={t('habit.reset')}
                  variant="secondary"
                  style={styles.add}
                  onPress={() => A.setCheckValue(h.id, today, 0)}
                />
              ) : (
                steps(full).map((n, i, all) => (
                  <Button
                    key={n}
                    label={t('habit.add', { step: n })}
                    variant={i === all.length - 1 ? 'primary' : 'secondary'}
                    style={styles.add}
                    onPress={() => {
                      vibrateImpact();
                      A.setCheckValue(h.id, today, Math.min(full, value + n));
                    }}
                  />
                ))
              )
            ) : (
              <Button
                label={t(day.mark === 'full' ? 'habit.unmark' : 'habit.mark')}
                variant={day.mark === 'full' ? 'secondary' : 'primary'}
                style={styles.add}
                onPress={() => {
                  if (day.mark !== 'full') vibrateImpact();
                  A.toggleCheck(h.id, today);
                }}
              />
            )}
          </View>
        )}
      </Card>

      <Card style={styles.streak} shadow="none">
        <View>
          <Text style={[TYPE.meta, { color: p.muted }]}>{t('habit.streak')}</Text>
          <Text style={[TYPE.numberM, { color: p.text }]}>{stats.streak}</Text>
          <Text style={[TYPE.caption, { color: p.muted }]}>
            {t('habit.best', { count: stats.best })}
          </Text>
        </View>
        {!plain && (
          <View style={styles.notches}>
            <Notches count={stats.streak} height={32} />
          </View>
        )}
      </Card>

      <Card style={styles.month}>
        <View style={styles.monthHead}>
          <Text style={[TYPE.control, { color: p.text }]}>{t('habit.month')}</Text>
          <Text style={[TYPE.meta, { color: p.muted }]}>
            <Text style={[TYPE.badge, { color: p.text }]}>
              {bad || !numeric ? stats.doneDays : stats.total}
            </Text>{' '}
            {t('habit.total')}
          </Text>
        </View>
        <View style={styles.weekdays}>
          {weekdays.map((d) => (
            <Text key={d} style={[TYPE.tiny, styles.weekday, { color: p.muted }]}>
              {t(`day.short.${d}` as MessageKey)}
            </Text>
          ))}
        </View>
        <MoonGrid days={view.month} size={26} />
        {!plain && (
          <Text style={[TYPE.caption, { color: p.muted }]}>
            {t(bad ? 'habit.legendBad' : 'habit.legend')}
          </Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          label={t(rest ? 'habit.restOff' : 'habit.rest')}
          variant="secondary"
          style={styles.action}
          onPress={toggleRest}
        />
        <Button
          label={t(
            bad
              ? slip
                ? 'habit.relapseOff'
                : 'habit.relapse'
              : slip
                ? 'habit.slipOff'
                : 'habit.slip'
          )}
          variant="danger"
          style={styles.action}
          onPress={toggleSlip}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  titles: { flex: 1, minWidth: 0 },
  progress: { gap: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.lg },
  score: { flex: 1, gap: 2 },
  adds: { flexDirection: 'row', gap: 10 },
  add: { flex: 1, paddingHorizontal: SPACE.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: SPACE.md },
  notches: { flex: 1, overflow: 'hidden' },
  month: { gap: 10 },
  monthHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  weekdays: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: SPACE.md },
  action: { flex: 1, paddingHorizontal: SPACE.sm },
});
