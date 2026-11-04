/**
 * «Сегодня» (design/mult/M-Today): дата плашкой, луна дня в наклейке со счётом и очками дня,
 * волк с цитатой, строка «Запиши…», «Осталось» лунами и журнал «Сделано» со временем.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { addDays, clockOf } from '../../core/dates';
import { closedStreak, dayNumber, dayView, isClosed, type DayItem } from '../../core/day';
import { dataOf, fullValue, habitStats, indexHabits } from '../../core/habits';
import { dayPoints } from '../../core/points';
import { quoteOfDay } from '../../core/quotes';
import { settingsOf } from '../../core/settings';
import { useDataStore } from '../../core/store';
import { quoteCount, type MessageKey } from '../../i18n';
import { useT, type Translate } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { RADIUS, SIZE, SPACE, TILT } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow, IconButton } from '../../ui/Button';
import { Moon } from '../../ui/Moon';
import { LogRow, MoonRow } from '../../ui/MoonRow';
import { PriorityMarks } from '../../ui/Priority';
import { SectionTitle } from '../../ui/ScreenHeader';
import { Card, Pill, Tag, WolfQuote } from '../../ui/Sticker';
import { useToast } from '../../ui/toast';
import { dayMonth, fullDate } from '../format';
import { useNewSheet } from '../new/newSheetStore';

type Props = { onOpenSettings: () => void };

export function TodayScreen({ onOpenSettings }: Props) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const showNew = useNewSheet((s) => s.show);

  const view = useMemo(() => {
    const idx = indexHabits(data);
    const day = dayView(data, today, today, idx);
    const points = dayPoints(data, today, today, idx);
    const streakOf = (habitId: string) => {
      const h = data.habits[habitId];
      return h ? habitStats(h, dataOf(idx, habitId), today).streak : 0;
    };
    return { day, points, streakOf };
  }, [data, today]);

  const settings = settingsOf(data);
  const quote = quoteOfDay(settings, today, quoteCount('ru'));
  const { day } = view;
  const closed = isClosed(data, today);
  const streak = closedStreak(data, today);
  const number = dayNumber(data.profile.startedAt, today);
  const rest = day.total - day.done;

  const phaseText =
    day.total === 0
      ? t('today.empty')
      : rest > 0
        ? t('today.toFull', { count: rest })
        : t(closed ? 'today.closed' : 'today.fullMoon');

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <View style={styles.header}>
        <View style={styles.titles}>
          <Tag label={fullDate(t, today)} font="date" tilt={TILT.slightLeft} shadow="sm" />
          <Text style={[TYPE.meta, { color: p.muted }]}>
            {streak > 0
              ? t('today.meta', { day: number, streak })
              : t('today.metaFirst', { day: number })}
          </Text>
        </View>
        <IconButton icon="settings" label={t('settings.title')} onPress={onOpenSettings} />
      </View>

      <Card radius={RADIUS.xl} style={styles.hero}>
        <View
          style={styles.heroRow}
          accessible
          accessibilityLabel={t('today.progress', { done: day.done, total: day.total })}
        >
          <Moon phase={day.phase} size={SIZE.moonDay} />
          <View style={styles.score}>
            <Text style={[TYPE.numberXL, { color: p.text }]}>
              {day.done}
              <Text style={[TYPE.numberXLLight, { color: p.muted }]}>
                {' / '}
                {day.total}
              </Text>
            </Text>
            <Text style={[TYPE.note, { color: p.muted }]}>{phaseText}</Text>
          </View>
        </View>
        {settings.ranks && view.points > 0 && (
          <View style={styles.points}>
            <Tag
              label={t('today.points', { count: view.points })}
              tone="sun"
              font="badge"
              tilt={6}
              header={false}
            />
          </View>
        )}
      </Card>

      {quote !== null && (
        <WolfQuote
          text={t(`quote.${quote}` as MessageKey)}
          sign={t('wolf.signature')}
          mood={day.total > 0 && rest === 0 ? 'proud' : 'smirk'}
        />
      )}

      <AddRow label={t('common.addPrompt')} onPress={() => showNew('task')} />

      {day.left.length > 0 && (
        <View style={styles.section}>
          <SectionTitle
            title={t('today.left')}
            count={day.left.length}
            tone="sun"
            tilt={TILT.left}
          />
          <Card padded={false}>
            {day.left.map((item, i) => (
              <LeftRow
                key={`${item.kind}:${item.id}`}
                item={item}
                today={today}
                view={view}
                t={t}
                last={i === day.left.length - 1}
              />
            ))}
          </Card>
        </View>
      )}

      {day.log.length > 0 && (
        <View style={styles.section}>
          <SectionTitle
            title={t('today.done')}
            count={day.done}
            tone="teal"
            tilt={TILT.slightRight}
          />
          <View>
            {day.log.map((item) => (
              <LogRow
                key={`${item.kind}:${item.id}`}
                time={item.at !== null ? clockOf(item.at) : ''}
                title={item.title}
                mark={t(
                  item.state === 'slip' ? 'mark.slip' : item.bad ? 'mark.clean' : 'mark.done'
                )}
                bad={item.state === 'slip'}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

type RowProps = {
  item: DayItem;
  today: string;
  view: { streakOf: (habitId: string) => number };
  t: Translate;
  last: boolean;
};

function LeftRow({ item, today, view, t, last }: RowProps) {
  const p = usePalette();
  const data = useDataStore((s) => s.data);
  const toast = useToast((s) => s.show);

  if (item.kind === 'task') {
    const task = data.tasks[item.id];
    if (!task) return null;
    const sub = item.debt
      ? task.date === addDays(today, -1)
        ? t('row.debtYesterday')
        : t('row.debtSince', { date: dayMonth(t, task.date!) })
      : task.remindAt
        ? t('row.remindAt', { time: task.remindAt })
        : undefined;
    const right = item.debt ? (
      <Pill label={t('mark.debt')} tone="red" filled />
    ) : task.priority > 0 ? (
      <PriorityMarks level={task.priority} />
    ) : null;
    return (
      <MoonRow
        title={item.title}
        sub={sub}
        phase={0}
        debt={item.debt}
        right={right}
        last={last}
        onToggle={() => {
          A.toggleTask(task.id);
          toast(t('toast.marked', { title: item.title }), {
            label: t('common.undo'),
            onPress: () => A.toggleTask(task.id),
          });
        }}
      />
    );
  }

  const habit = data.habits[item.id];
  if (!habit) return null;
  const streak = view.streakOf(habit.id);
  const numeric = habit.measure === 'numeric';
  const value = data.checks[`${habit.id}|${today}`]?.value ?? 0;
  const sub = numeric
    ? [
        t('row.numericLeft', { left: Math.max(0, habit.target - value) }),
        streak > 0 ? t('row.streak', { count: streak }) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;
  const meta = numeric
    ? t('row.numeric', { value, target: habit.target })
    : streak > 0
      ? t('row.streakShort', { count: streak })
      : '';
  return (
    <MoonRow
      title={item.title}
      sub={sub}
      phase={item.fraction}
      last={last}
      right={meta ? <Text style={[TYPE.badge, { color: p.text }]}>{meta}</Text> : null}
      onToggle={() => {
        A.setCheckValue(habit.id, today, fullValue(habit));
        toast(t('toast.marked', { title: item.title }), {
          label: t('common.undo'),
          onPress: () => A.setCheckValue(habit.id, today, value),
        });
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titles: { flex: 1, alignItems: 'flex-start', gap: SPACE.sm },
  hero: { marginTop: SPACE.xs },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.hero },
  score: { flex: 1, gap: SPACE.xs },
  points: { position: 'absolute', top: -16, right: 14 },
  section: { gap: SPACE.md },
});
