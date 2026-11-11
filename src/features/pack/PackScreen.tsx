/**
 * «Стая» (design/mult/M-Pack): звание с волком, очки и полоса до следующего звания, лестница
 * званий плашками; неделя столбиками-наклейками; четыре числа наклейками. Если звания выключены
 * в настройках — остаются неделя и числа.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { weekday } from '../../core/dates';
import { dayNumber } from '../../core/day';
import { packWeek, RANKS, rankOf, totalPoints } from '../../core/points';
import { effectiveSettings } from '../../core/settings';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Wolf } from '../../ui/icons';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Card, Tag, type Tone } from '../../ui/Sticker';
import { groupDigits } from '../format';
import { designStyles } from '../../theme/design';

const BAR_MAX = 72;
const RANK_TILT = [-3, 2, -2, 3, -1];

export function PackScreen() {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const settings = effectiveSettings(data);

  const { week, rank } = useMemo(
    () => ({ week: packWeek(data, today), rank: rankOf(totalPoints(data, today)) }),
    [data, today]
  );
  const days = dayNumber(data.profile.startedAt, today);
  const maxMarks = Math.max(1, ...week.days.map((d) => d.marks));
  const rankName = (key: string) => t(`rank.${key}` as MessageKey);

  // Полоса — путь от текущего звания до следующего.
  const from = RANKS[rank.rank].min;
  const progress = rank.next ? (rank.points - from) / (RANKS[rank.next.rank].min - from) : 1;

  const nums: { value: string; label: string; tone: Tone; tilt: number }[] = [
    {
      value: String(week.tasksDone),
      label: t('pack.tasksDone', { count: week.tasksDone }),
      tone: 'surface',
      tilt: -1,
    },
    ...(week.cleanStreak !== null
      ? [
          {
            value: String(week.cleanStreak),
            label: t('pack.cleanStreak', { count: week.cleanStreak }),
            tone: 'teal' as const,
            tilt: 1.5,
          },
        ]
      : []),
    { value: String(week.bestStreak), label: t('pack.bestStreak'), tone: 'sun', tilt: 1 },
    {
      value: String(week.slips),
      label: t('pack.slips', { count: week.slips }),
      tone: week.slips > 0 ? 'red' : 'surface',
      tilt: -1.5,
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader kicker={t('pack.with', { count: days })} title={t('tab.pack')} />

      {settings.ranks && (
        <Card radius={RADIUS.xl} style={styles.rank}>
          <View style={styles.rankHead}>
            <Wolf mood={rank.next ? 'smirk' : 'proud'} size={84} />
            <View style={styles.rankText}>
              <Text style={[TYPE.meta, { color: p.muted }]}>{t('pack.rank')}</Text>
              <Text accessibilityRole="header" style={[TYPE.rank, { color: p.text }]}>
                {rankName(rank.key)}
              </Text>
              <Text style={[TYPE.note, { color: p.text }]}>
                {t('pack.points', { count: rank.points, value: groupDigits(rank.points) })}
              </Text>
            </View>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
            style={[styles.track, { backgroundColor: p.track, borderColor: p.line }]}
          >
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: p.sun,
                  borderColor: p.line,
                },
              ]}
            />
          </View>
          <Text style={[TYPE.meta, { color: p.muted }]}>
            {rank.next
              ? t('pack.toNext', {
                  rank: rankName(rank.next.key),
                  left: groupDigits(rank.next.left),
                })
              : t('pack.top')}
          </Text>
          <View style={styles.ladder} accessibilityLabel={t('pack.ranks')}>
            {RANKS.map((r, i) => (
              <Tag
                key={r.key}
                label={rankName(r.key)}
                tone={i === rank.rank ? 'sun' : i < rank.rank ? 'tag' : 'surface'}
                tilt={RANK_TILT[i]}
                header={false}
              />
            ))}
          </View>
        </Card>
      )}

      <Card radius={RADIUS.xl} style={styles.week}>
        <View style={styles.weekHead}>
          <Text style={[TYPE.control, { color: p.text }]}>{t('pack.week')}</Text>
          <Text style={[TYPE.meta, { color: p.muted }]}>
            <Text style={[TYPE.numberM, { color: p.text }]}>{week.marks}</Text>{' '}
            {t('pack.marks', { count: week.marks })}
          </Text>
        </View>
        <View style={styles.bars}>
          {week.days.map((d) => {
            const isToday = d.date === today;
            return (
              <View key={d.date} style={styles.barCol}>
                <Text style={[TYPE.mark, { color: p.text }]}>{d.marks}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(8, Math.round((d.marks / maxMarks) * BAR_MAX)),
                      backgroundColor: isToday ? p.sun : p.tag,
                      borderColor: p.line,
                    },
                  ]}
                />
                <Text
                  style={[isToday ? TYPE.mark : TYPE.tiny, { color: isToday ? p.text : p.muted }]}
                >
                  {t(`day.short.${weekday(d.date)}` as MessageKey)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.nums}>
        {nums.map((n) => (
          <View key={n.label} style={styles.num}>
            <Card
              tone={n.tone}
              shadow="md"
              radius={18}
              style={[styles.numCard, { transform: [{ rotate: `${n.tilt}deg` }] }]}
            >
              <NumText value={n.value} label={n.label} tone={n.tone} />
            </Card>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function NumText({ value, label, tone }: { value: string; label: string; tone: Tone }) {
  const p = usePalette();
  const fg = { surface: p.text, tag: p.text, sun: p.onSun, teal: p.onTeal, red: p.onRed }[tone];
  return (
    <>
      <Text style={[TYPE.numberL, { color: fg }]}>{value}</Text>
      <Text style={[TYPE.meta, { color: fg }]}>{label}</Text>
    </>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
    rank: { gap: SPACE.md },
    rankHead: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
    rankText: { flex: 1, gap: 2 },
    track: {
      height: 18,
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.pill,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRightWidth: STROKE.outline },
    ladder: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.tight },
    week: { gap: SPACE.md },
    weekHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.sm, height: 118 },
    barCol: { flex: 1, alignItems: 'center', gap: SPACE.xs },
    bar: {
      alignSelf: 'stretch',
      borderWidth: STROKE.outline,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
    nums: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md },
    num: { width: '47%', flexGrow: 1 },
    numCard: { gap: 2, paddingVertical: SPACE.md },
  })
);
