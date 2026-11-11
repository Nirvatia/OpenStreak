/**
 * «Цели» (design/mult/M-Goals): договор наклейкой — номер и сфера плашкой, сколько дней
 * осталось, зачёт, награда, «если слил» и бейдж «Слово дано»; ниже — остальные договоры.
 * Тап по строке выносит договор наверх. «Зачёт» закрывает договор, «Изменить» — шторка.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { vibrateSuccess } from '../../services/haptics';
import { goalCounts, goalViews, type GoalView } from '../../core/goals';
import { useDataStore } from '../../core/store';
import { useT, type Translate } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow, Button, IconButton } from '../../ui/Button';
import { Icon } from '../../ui/icons';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { Card, Pill, Tag } from '../../ui/Sticker';
import { useToast } from '../../ui/toast';
import { dayMonth, isoOfMs, shortDate } from '../format';
import { useNewSheet } from '../new/newSheetStore';
import { designStyles } from '../../theme/design';

export function GoalsScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const toast = useToast((s) => s.show);
  const { show, editGoal } = useNewSheet();
  const [picked, setPicked] = useState<string | null>(null);

  const views = useMemo(() => goalViews(data, today), [data, today]);
  const counts = goalCounts(data);
  const areaName = (id: string | null) => (id ? data.areas[id]?.name : undefined);
  const featured = views.find((v) => v.goal.id === picked) ?? views[0];
  const others = views.filter((v) => v !== featured);

  const kicker = [
    t('goals.count', { count: counts.total }),
    counts.done > 0 ? t('goals.closed', { count: counts.done }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const toggle = (v: GoalView) => {
    A.toggleGoal(v.goal.id);
    if (v.state !== 'done') {
      vibrateSuccess();
      toast(t('toast.goalDone'), {
        label: t('common.undo'),
        onPress: () => A.toggleGoal(v.goal.id),
      });
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader
        kicker={counts.total ? kicker : undefined}
        title={t('tab.goals')}
        right={
          <IconButton
            icon="plus"
            variant="sun"
            label={t('goals.add')}
            onPress={() => show('goal')}
          />
        }
      />

      {!featured && (
        <View style={styles.empty}>
          <Text style={[TYPE.body, { color: p.muted }]}>{t('goals.empty')}</Text>
          <AddRow label={t('goals.add')} onPress={() => show('goal')} />
        </View>
      )}

      {featured && (
        <Contract
          view={featured}
          area={areaName(featured.goal.areaId)}
          t={t}
          onToggle={() => toggle(featured)}
          onEdit={() => editGoal(featured.goal.id)}
        />
      )}

      {others.length > 0 && (
        <View style={styles.section}>
          <SectionTitle title={t('goals.others')} count={others.length} tilt={1.5} />
          <Card padded={false}>
            {others.map((v, i) => (
              <OtherRow
                key={v.goal.id}
                view={v}
                area={areaName(v.goal.areaId)}
                t={t}
                last={i === others.length - 1}
                onPress={() => setPicked(v.goal.id)}
              />
            ))}
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

function Contract({
  view,
  area,
  t,
  onToggle,
  onEdit,
}: {
  view: GoalView;
  area?: string;
  t: Translate;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const p = usePalette();
  const { goal, state, daysLeft } = view;
  const done = state === 'done';
  const number = t('goals.number', { number: String(view.number).padStart(3, '0') });
  const fields: [string, string, boolean][] = [
    [t('goals.criterion'), goal.criterion, false],
    [t('goals.reward'), goal.reward, false],
    [t('goals.penalty'), goal.penalty, true],
  ];
  return (
    <Card radius={RADIUS.xl} style={styles.contract}>
      <View style={styles.number}>
        <Tag label={area ? `${number} · ${area}` : number} tilt={-3} header={false} />
      </View>
      <Text
        accessibilityRole="header"
        style={[
          TYPE.heading,
          { color: done ? p.muted : p.text, textDecorationLine: done ? 'line-through' : 'none' },
        ]}
      >
        {goal.text}
      </Text>

      {!done && (
        <View style={styles.deadline}>
          {daysLeft !== null && daysLeft > 0 && (
            <View style={[styles.days, { backgroundColor: p.sun, borderColor: p.line }]}>
              <Text style={[TYPE.numberL, { color: p.onSun }]}>{daysLeft}</Text>
              <Text style={[TYPE.control, { color: p.onSun }]}>
                {t('goals.daysLeft', { count: daysLeft })}
              </Text>
            </View>
          )}
          <Text style={[TYPE.meta, styles.when, { color: state === 'overdue' ? p.red : p.muted }]}>
            {state === 'overdue'
              ? t('goals.overdueBy', { count: -(daysLeft ?? 0) })
              : daysLeft === 0
                ? t('goals.dueToday')
                : goal.deadline
                  ? t('goals.deadline', { date: dayMonth(t, goal.deadline) })
                  : t('goals.noDeadline')}
          </Text>
        </View>
      )}

      {fields
        .filter(([, value]) => !!value)
        .map(([label, value, risky]) => (
          <View key={label} style={styles.field}>
            <Text style={[risky ? TYPE.mark : TYPE.meta, { color: risky ? p.red : p.muted }]}>
              {label}
            </Text>
            <Text style={[TYPE.item, { color: p.text }]}>{value}</Text>
          </View>
        ))}

      <View style={styles.word}>
        <Tag
          label={
            done && goal.doneOn
              ? t('goals.closedOn', { date: shortDate(goal.doneOn) })
              : t('goals.word', { date: shortDate(isoOfMs(goal.createdAt)) })
          }
          tone="teal"
          tilt={4}
          header={false}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={t(done ? 'goals.reopen' : 'goals.done')}
          variant={done ? 'secondary' : 'primary'}
          style={styles.action}
          onPress={onToggle}
        />
        <Button label={t('goals.edit')} variant="secondary" onPress={onEdit} />
      </View>
    </Card>
  );
}

function OtherRow({
  view,
  area,
  t,
  last,
  onPress,
}: {
  view: GoalView;
  area?: string;
  t: Translate;
  last: boolean;
  onPress: () => void;
}) {
  const p = usePalette();
  const { goal, state, daysLeft } = view;
  const done = state === 'done';
  const overdue = state === 'overdue';
  const sub = done
    ? [area, goal.doneOn ? t('goals.closedOn', { date: shortDate(goal.doneOn) }) : null]
    : overdue
      ? [t('goals.overdueBy', { count: -(daysLeft ?? 0) })]
      : [area, goal.reward ? t('goals.rewardShort', { reward: goal.reward }) : null];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && {
          borderBottomWidth: STROKE.thin,
          borderBottomColor: p.divider,
          borderStyle: 'dashed',
        },
        pressed && { backgroundColor: p.tag },
      ]}
    >
      <View style={styles.rowText}>
        <Text
          style={[
            TYPE.item,
            { color: done ? p.muted : p.text, textDecorationLine: done ? 'line-through' : 'none' },
          ]}
        >
          {goal.text}
        </Text>
        {sub.some(Boolean) && (
          <Text style={[TYPE.meta, { color: overdue ? p.red : p.muted }]}>
            {sub.filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>
      {done ? (
        <Pill label={t('goals.closedMark')} />
      ) : daysLeft !== null ? (
        <Text style={[TYPE.numberM, { color: overdue ? p.red : p.text }]}>
          {overdue ? `−${-daysLeft}` : daysLeft}
        </Text>
      ) : (
        <Icon name="chevron" size={18} tone="muted" />
      )}
    </Pressable>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
    empty: { gap: SPACE.md },
    contract: { gap: 14, marginTop: SPACE.sm, paddingTop: 22 },
    number: { position: 'absolute', top: -16, left: 14 },
    deadline: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    days: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: SPACE.tight,
      paddingHorizontal: 14,
      paddingVertical: SPACE.sm,
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.md,
    },
    when: { flex: 1 },
    field: { gap: 2 },
    word: { alignItems: 'flex-end' },
    actions: { flexDirection: 'row', gap: SPACE.md },
    action: { flex: 1 },
    section: { gap: SPACE.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACE.md,
      minHeight: 64,
      paddingHorizontal: 14,
    },
    rowText: { flex: 1, minWidth: 0, paddingVertical: SPACE.sm },
  })
);
