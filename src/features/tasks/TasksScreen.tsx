/**
 * «Дела» (design/mult/M-Tasks): сколько в работе и долгов, поиск, сферы, группы
 * «Долги / Сегодня / Завтра / Позже / Без даты». Луна — выполнить (выполненное остаётся
 * зачёркнутым до конца дня), тап по строке — правка, свайп влево — вычеркнуть с «Вернуть».
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { addDays } from '../../core/dates';
import { live, type Task } from '../../core/model';
import { useDataStore } from '../../core/store';
import { openTasksByArea, taskCounts, taskGroups, type TaskGroupKey } from '../../core/tasks';
import type { MessageKey } from '../../i18n';
import { useT, type Translate } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { RADIUS, SPACE, STROKE, TILT } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow, IconButton } from '../../ui/Button';
import { Card, type Tone } from '../../ui/Sticker';
import { Chip } from '../../ui/Chip';
import { MoonRow } from '../../ui/MoonRow';
import { PriorityMarks } from '../../ui/Priority';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { SwipeRow } from '../../ui/SwipeRow';
import { TextField } from '../../ui/TextField';
import { useToast } from '../../ui/toast';
import { dayMonth } from '../format';
import { useNewSheet } from '../new/newSheetStore';

/** Цвет и наклон плашки группы: долги — красные, сегодня — жёлтая, дальше — бумажные. */
const GROUP_TONE: Record<TaskGroupKey, [Tone, number]> = {
  debts: ['red', TILT.slightLeft],
  today: ['sun', TILT.slightRight],
  tomorrow: ['tag', -1.5],
  later: ['tag', 2],
  someday: ['tag', -1],
};

const GROUP_LABEL: Record<TaskGroupKey, MessageKey> = {
  debts: 'tasks.overdue',
  today: 'tasks.group.today',
  tomorrow: 'tasks.group.tomorrow',
  later: 'tasks.group.later',
  someday: 'tasks.group.someday',
};

export function TasksScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const toast = useToast((s) => s.show);
  const { show, editTask } = useNewSheet();
  const [area, setArea] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const areas = useMemo(
    () => live(data.areas).sort((a, b) => a.createdAt - b.createdAt),
    [data.areas]
  );
  const areaName = useMemo(() => new Map(areas.map((a) => [a.id, a.name])), [areas]);
  const perArea = useMemo(() => openTasksByArea(data), [data]);
  const counts = taskCounts(data, today);

  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return taskGroups(data, today, { areaId: area })
      .map((g) => ({
        ...g,
        tasks: q ? g.tasks.filter((x) => x.title.toLocaleLowerCase().includes(q)) : g.tasks,
      }))
      .filter((g) => g.tasks.length > 0);
  }, [data, today, area, query]);

  const kicker = [
    t('tasks.open', { count: counts.open }),
    counts.debts > 0 ? t('tasks.debts', { count: counts.debts }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const remove = (task: Task) => {
    A.deleteTask(task.id);
    toast(t('toast.taskDeleted'), {
      label: t('common.return'),
      onPress: () => A.restoreTask(task.id),
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader
        kicker={kicker}
        title={t('tab.tasks')}
        right={
          <IconButton
            icon="plus"
            variant="sun"
            label={t('tasks.add')}
            onPress={() => show('task', { areaId: area })}
          />
        }
      />

      <TextField
        variant="search"
        label={t('tasks.searchLabel')}
        placeholder={t('tasks.search')}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      {areas.length > 0 && (
        <View
          style={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('tasks.areas')}
        >
          <Chip
            role="radio"
            label={t('tasks.all')}
            selected={area === null}
            onPress={() => setArea(null)}
          />
          {areas.map((a) => {
            const n = perArea.get(a.id) ?? 0;
            return (
              <Chip
                key={a.id}
                role="radio"
                label={n ? t('tasks.areaCount', { name: a.name, count: n }) : a.name}
                selected={area === a.id}
                onPress={() => setArea(area === a.id ? null : a.id)}
              />
            );
          })}
        </View>
      )}

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[TYPE.body, { color: p.muted }]}>
            {t(query.trim() ? 'tasks.notFound' : 'tasks.empty')}
          </Text>
          {!query.trim() && (
            <AddRow label={t('tasks.add')} onPress={() => show('task', { areaId: area })} />
          )}
        </View>
      ) : (
        groups.map((g) => (
          <View key={g.key} style={styles.group}>
            <SectionTitle
              title={t(GROUP_LABEL[g.key])}
              count={g.tasks.length}
              tone={GROUP_TONE[g.key][0]}
              tilt={GROUP_TONE[g.key][1]}
            />
            <Card padded={false}>
              {/* Обрезка — во внутреннем блоке: подложка свайпа не вылезает за скругления,
                  а тень наклейки остаётся снаружи. */}
              <View style={styles.clip}>
                {g.tasks.map((task, i) => (
                  <SwipeRow key={task.id} label={t('tasks.swipe')} onSwipe={() => remove(task)}>
                    {(guard) => (
                      <MoonRow
                        title={task.title}
                        sub={metaOf(task, today, areaName, t)}
                        phase={task.doneOn ? 1 : 0}
                        done={task.doneOn !== null}
                        debt={g.key === 'debts'}
                        onToggle={guard(() => A.toggleTask(task.id))}
                        onPress={guard(() => editTask(task.id))}
                        right={task.priority > 0 ? <PriorityMarks level={task.priority} /> : null}
                        last={i === g.tasks.length - 1}
                      />
                    )}
                  </SwipeRow>
                ))}
              </View>
            </Card>
          </View>
        ))
      )}

      {groups.length > 0 && <Text style={[TYPE.meta, { color: p.muted }]}>{t('tasks.hint')}</Text>}
    </ScrollView>
  );
}

/** Подпись под делом: когда (для долгов и «Позже» — дата, иначе время напоминания) · сфера. */
function metaOf(task: Task, today: string, areas: Map<string, string>, t: Translate): string {
  const when =
    task.date !== null && task.date < today && task.doneOn === null
      ? task.date === addDays(today, -1)
        ? t('tasks.yesterday')
        : dayMonth(t, task.date)
      : task.date !== null && task.date > addDays(today, 1)
        ? dayMonth(t, task.date)
        : task.remindAt;
  const area = task.areaId ? areas.get(task.areaId) : undefined;
  return [when, area].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight },
  group: { marginTop: SPACE.xs, gap: SPACE.md },
  clip: { overflow: 'hidden', borderRadius: RADIUS.lg - STROKE.outline },
  empty: { gap: SPACE.md, paddingTop: SPACE.sm },
});
