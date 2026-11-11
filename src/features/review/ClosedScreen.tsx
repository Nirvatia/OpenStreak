/**
 * «День закрыт» (design/mult/M-Closed): полная луна и довольный волк на холме, днём — небо,
 * вечером — звёзды; цитата волка, наклейки с итогом (сделано, серия, очки дня), «Понял»
 * и первое напоминание на завтра.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { addDays } from '../../core/dates';
import { closedStreak, dayView, firstReminder } from '../../core/day';
import { indexHabits } from '../../core/habits';
import { dayPoints } from '../../core/points';
import { quoteOfDay } from '../../core/quotes';
import { effectiveSettings } from '../../core/settings';
import { useDataStore } from '../../core/store';
import { quoteCount, type MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette, usePlain, useThemeStore } from '../../store/themeStore';
import { SPACE, STROKE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Icon, Wolf } from '../../ui/icons';
import { fullDate } from '../format';
import { Moon } from '../../ui/Moon';
import { Tag, WolfQuote } from '../../ui/Sticker';

/** Звёзды вечернего неба: x, y и размер — декорация, текста на них нет. */
const STARS: [number, number, number][] = [
  [0.09, 60, 4],
  [0.23, 128, 3],
  [0.82, 70, 5],
  [0.9, 150, 3],
  [0.15, 230, 3],
  [0.77, 250, 4],
  [0.46, 34, 3],
  [0.64, 110, 3],
];

const MOON = 200;
const WOLF = 140;
const STAGE = 340;

export function ClosedScreen({ onDone }: { onDone: () => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const night = useThemeStore((s) => s.scheme === 'dark');
  const plain = usePlain();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const settings = effectiveSettings(data);

  const info = useMemo(() => {
    const idx = indexHabits(data);
    return {
      day: dayView(data, today, today, idx),
      points: dayPoints(data, today, today, idx),
      streak: closedStreak(data, today),
      next: firstReminder(data, addDays(today, 1)),
    };
  }, [data, today]);

  // Вечерняя цитата — следующая после утренней, чтобы не повторяться за день.
  const count = quoteCount('ru');
  const morning = quoteOfDay(settings, today, count);
  const quote = morning === null ? null : (morning + 1) % count;
  if (plain) {
    // «Обычный»: без волка, луны и цитаты — галочка, числа дня и что будет завтра.
    const numbers = [
      { value: `${info.day.done}/${info.day.total}`, label: t('closed.rowDone') },
      ...(info.streak > 0 ? [{ value: String(info.streak), label: t('closed.rowStreak') }] : []),
    ];
    return (
      <View style={[styles.plainFill, { backgroundColor: p.bg }]}>
        <View style={styles.plainBody}>
          <View style={[styles.plainCheck, { backgroundColor: p.line }]}>
            <Icon name="check" size={36} tone="onSun" />
          </View>
          <View>
            <Text style={[TYPE.meta, { color: p.muted }]}>{fullDate(t, today)}</Text>
            <Text accessibilityRole="header" style={[TYPE.display, { color: p.text }]}>
              {t('closed.title')}
            </Text>
          </View>
          <View style={[styles.plainNumbers, { borderColor: p.divider }]}>
            {numbers.map((n, i) => (
              <View
                key={n.label}
                style={[
                  styles.plainNumber,
                  i > 0 && { borderLeftWidth: 1, borderLeftColor: p.divider, paddingLeft: 14 },
                ]}
              >
                <Text style={[TYPE.numberL, { color: p.text }]}>{n.value}</Text>
                <Text style={[TYPE.caption, { color: p.muted }]}>{n.label}</Text>
              </View>
            ))}
          </View>
          {info.next && (
            <Text style={[TYPE.body, { color: p.muted }]}>
              {t('closed.tomorrow', { time: info.next.time, title: info.next.title })}
            </Text>
          )}
        </View>
        <View style={[styles.plainFooter, { paddingBottom: insets.bottom + SPACE.lg }]}>
          <Button label={t('closed.ok')} onPress={onDone} />
        </View>
      </View>
    );
  }

  const sky = night ? p.bg : p.sky;
  // Земля под волком продолжается под текстом — экран «стоит» на холме.
  const ground = night ? p.surface : p.tag;

  return (
    <ScrollView style={{ backgroundColor: sky }} contentContainerStyle={styles.content}>
      <View style={[styles.stage, { paddingTop: insets.top + SPACE.xl }]} aria-hidden>
        {night &&
          STARS.map(([x, y, r], i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: x * width,
                  top: insets.top + y,
                  width: r,
                  height: r,
                  backgroundColor: p.star,
                },
              ]}
            />
          ))}
        <Moon phase={1} size={MOON} />
        <View style={styles.wolf}>
          <Wolf mood="proud" size={WOLF} />
        </View>
        <Svg
          width={width}
          height={70}
          viewBox={`0 0 ${width} 70`}
          style={styles.hill}
          preserveAspectRatio="none"
        >
          <Path
            d={`M-4 40 C${width * 0.15} 10 ${width * 0.3} 14 ${width * 0.46} 30 C${width * 0.64} 48 ${
              width * 0.82
            } 18 ${width + 4} 26 L${width + 4} 74 L-4 74 Z`}
            fill={ground}
            stroke={p.line}
            strokeWidth={STROKE.outline}
          />
        </Svg>
      </View>

      <View
        style={[styles.body, { backgroundColor: ground, paddingBottom: insets.bottom + SPACE.lg }]}
      >
        <Text accessibilityRole="header" style={[TYPE.display, styles.center, { color: p.text }]}>
          {t('closed.title')}
        </Text>

        {quote !== null && (
          <WolfQuote
            text={t(`quote.${quote}` as MessageKey)}
            sign={t('wolf.signature')}
            wolf={false}
            tone={night ? 'tag' : 'surface'}
          />
        )}

        <View style={styles.tags}>
          <Tag
            label={t('closed.of', { done: info.day.done, total: info.day.total })}
            tone="sun"
            font="date"
            tilt={-4}
            shadow="sm"
            header={false}
          />
          {info.streak > 0 && (
            <Tag
              label={t('closed.streak', { count: info.streak })}
              tone="teal"
              font="date"
              tilt={3}
              shadow="sm"
              header={false}
            />
          )}
          {settings.ranks && info.points > 0 && (
            <Tag
              label={t('today.points', { count: info.points })}
              tone={night ? 'tag' : 'surface'}
              font="date"
              tilt={-2}
              shadow="sm"
              header={false}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Button label={t('closed.ok')} onPress={onDone} />
          {info.next && (
            <Text style={[TYPE.meta, styles.center, { color: p.text }]}>
              {t('closed.tomorrow', { time: info.next.time, title: info.next.title })}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  plainFill: { flex: 1 },
  plainBody: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACE.screenX, gap: 32 },
  plainCheck: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainNumbers: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 18,
  },
  plainNumber: { flex: 1, gap: 4 },
  plainFooter: { paddingHorizontal: SPACE.screenX },
  content: { flexGrow: 1 },
  stage: { height: STAGE, alignItems: 'center' },
  star: { position: 'absolute', borderRadius: 3 },
  wolf: { marginTop: -WOLF * 0.62 },
  hill: { position: 'absolute', left: 0, bottom: -18 },
  body: {
    flex: 1,
    paddingHorizontal: SPACE.xl,
    paddingTop: 34,
    gap: SPACE.lg,
  },
  center: { textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACE.md },
  footer: { marginTop: 'auto', gap: SPACE.md, paddingTop: SPACE.lg },
});
