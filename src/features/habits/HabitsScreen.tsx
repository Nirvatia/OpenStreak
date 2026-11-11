/**
 * «Привычки» (design/mult/M-Habits): сколько в деле и вредных, фильтр, наклейки привычек —
 * плитка-иконка, название, норма, бейдж серии, неделя лунами; заметка, если вчера слил.
 * Тап по наклейке — карточка привычки.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays } from '../../core/dates';
import {
  activeHabits,
  dataOf,
  habitDay,
  habitDays,
  habitStats,
  indexHabits,
} from '../../core/habits';
import { checkId } from '../../core/model';
import { settingsOf } from '../../core/settings';
import { useDataStore } from '../../core/store';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { SHADOW, SPACE, TILT } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { AddRow, IconButton } from '../../ui/Button';
import { IconTile } from '../../ui/icons';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Segmented } from '../../ui/Segmented';
import { Badge, Card, Tag } from '../../ui/Sticker';
import { WeekMoons } from '../../ui/WeekMoons';
import { useNewSheet } from '../new/newSheetStore';
import { habitMeta, moonDays, streakLabel } from './habitText';
import { designStyles } from '../../theme/design';

type Filter = 'all' | 'good' | 'bad';

/** Наклон бейджей серий по очереди — как наклейки, налепленные от руки. */
const BADGE_TILT = [8, -6, 5, -4];

export function HabitsScreen({ onOpen }: { onOpen: (habitId: string) => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const show = useNewSheet((s) => s.show);
  const [filter, setFilter] = useState<Filter>('all');
  const { weekStart } = settingsOf(data);

  const all = useMemo(() => {
    const idx = indexHabits(data);
    const yesterday = addDays(today, -1);
    return activeHabits(data).map((h) => {
      const hd = dataOf(idx, h.id);
      return {
        habit: h,
        stats: habitStats(h, hd, today),
        week: moonDays(habitDays(h, hd, addDays(today, -6), today, today), h, today),
        value: data.checks[checkId(h.id, today)]?.value ?? 0,
        slippedYesterday: h.kind === 'good' && habitDay(h, hd, yesterday, today).mark === 'slip',
      };
    });
  }, [data, today]);

  const badCount = all.filter((x) => x.habit.kind === 'bad').length;
  const shown = all.filter((x) => filter === 'all' || x.habit.kind === filter);
  const kicker = [
    t('habits.active', { count: all.length }),
    badCount > 0 ? t('habits.bad', { count: badCount }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader
        kicker={kicker}
        title={t('tab.habits')}
        right={
          <IconButton
            icon="plus"
            variant="sun"
            label={t('habits.add')}
            onPress={() => show('habit')}
          />
        }
      />

      {all.length > 0 && (
        <Segmented<Filter>
          label={t('habits.filter')}
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: t('habits.all') },
            { value: 'good', label: t('habits.good') },
            { value: 'bad', label: t('habits.badOnes') },
          ]}
        />
      )}

      {all.length === 0 && (
        <View style={styles.empty}>
          <Text style={[TYPE.body, { color: p.muted }]}>{t('habits.empty')}</Text>
          <AddRow label={t('habits.add')} onPress={() => show('habit')} />
        </View>
      )}

      {shown.map(({ habit: h, stats, week, value, slippedYesterday }, i) => (
        <Pressable
          key={h.id}
          accessibilityRole="button"
          accessibilityLabel={h.name}
          onPress={() => onOpen(h.id)}
        >
          {({ pressed }) => (
            <Card shadow={pressed ? 'none' : 'lg'} style={[styles.card, pressed && styles.pressed]}>
              <View style={styles.head}>
                <IconTile icon={h.icon} />
                <View style={styles.titles}>
                  <Text style={[TYPE.itemStrong, { color: p.text }]}>{h.name}</Text>
                  <Text style={[TYPE.meta, { color: p.muted }]}>
                    {habitMeta(t, h, value, weekStart)}
                  </Text>
                </View>
                <Badge
                  value={stats.streak}
                  label={streakLabel(t, h, stats.streak)}
                  tone={stats.streak === 0 ? 'tag' : h.kind === 'bad' ? 'teal' : 'sun'}
                  tilt={BADGE_TILT[i % BADGE_TILT.length]}
                />
              </View>
              <WeekMoons days={week} />
              {slippedYesterday && (
                <View style={styles.note}>
                  <Tag
                    label={t('habits.slipNote')}
                    tone="tag"
                    tilt={TILT.slightLeft}
                    header={false}
                    alert
                  />
                </View>
              )}
            </Card>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
    card: { gap: 14 },
    pressed: { transform: [{ translateX: SHADOW.lg }, { translateY: SHADOW.lg }] },
    head: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
    titles: { flex: 1, minWidth: 0 },
    note: { alignItems: 'flex-start' },
    empty: { gap: SPACE.md },
  })
);
