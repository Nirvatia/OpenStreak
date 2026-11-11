/**
 * «Итог дня» (design/mult/M-Review): волк с вердиктом, оценка дня пятью лунами — от «Слил»
 * до «Красава», заметка по желанию, «Закрыть день». Если день уже закрыт — правка итога.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { vibrateSuccess } from '../../services/haptics';
import { dayView, moodPhase } from '../../core/day';
import { useDataStore } from '../../core/store';
import type { MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette, usePlain } from '../../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../../theme/metrics';
import { hardShadow, tilt } from '../../theme/sticker';
import { TYPE } from '../../theme/type';
import { Button } from '../../ui/Button';
import { Moon } from '../../ui/Moon';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { WolfQuote } from '../../ui/Sticker';
import { TextField } from '../../ui/TextField';
import { fullDate } from '../format';
import { designStyles } from '../../theme/design';

const MOODS = [1, 2, 3, 4, 5] as const;
const TILTS = [-2, 1.5, -1, 2, -1.5];

type Props = { onBack: () => void; onClosed: () => void };

export function ReviewScreen({ onBack, onClosed }: Props) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((s) => s.data);
  const today = useDataStore((s) => s.today);
  const existing = data.reviews[today];
  const saved = existing && existing.deletedAt === null ? existing : undefined;
  const plain = usePlain();
  // В «Обычном» оценки дня нет: сохраняем нейтральную, чтобы запись осталась совместимой.
  const [mood, setMood] = useState<number>(saved?.mood ?? (plain ? 3 : 4));
  const [note, setNote] = useState(saved?.note ?? '');

  const day = useMemo(() => dayView(data, today, today), [data, today]);

  const close = () => {
    A.saveReview(today, mood, note);
    vibrateSuccess();
    onClosed();
  };

  return (
    <View style={[styles.fill, { backgroundColor: p.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.sm }]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          onBack={onBack}
          kicker={t('review.kicker', {
            date: fullDate(t, today),
            done: day.done,
            total: day.total,
          })}
          title={t('review.title')}
        />

        {plain && (
          <View>
            {[
              {
                name: t('review.rowDone'),
                value: t('review.of', { done: day.done, total: day.total }),
                red: false,
              },
              { name: t('review.rowLeft'), value: String(day.left.length), red: false },
              {
                name: t('review.rowDebt'),
                value: String(day.left.filter((i) => i.kind === 'task' && i.debt).length),
                red: day.left.some((i) => i.kind === 'task' && i.debt),
              },
            ].map((r) => (
              <View key={r.name} style={[styles.plainRow, { borderTopColor: p.divider }]}>
                <Text style={[TYPE.item, { color: p.text }]}>{r.name}</Text>
                <Text style={[TYPE.numberM, { color: r.red ? p.red : p.text }]}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}

        {!plain && (
          <View accessibilityLiveRegion="polite">
            <WolfQuote
              text={t(`review.verdict.${mood}` as MessageKey)}
              sign={t('wolf.signature')}
              mood={mood === 1 ? 'meh' : mood >= 4 ? 'proud' : 'smirk'}
            />
          </View>
        )}

        {!plain && (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={[TYPE.control, { color: p.text }]}>
              {t('review.question')}
            </Text>
            <View
              style={styles.moods}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('review.mood')}
            >
              {MOODS.map((m, i) => {
                const on = m === mood;
                return (
                  <Pressable
                    key={m}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => setMood(m)}
                    style={[
                      styles.mood,
                      { backgroundColor: on ? p.tag : p.surface, borderColor: p.line },
                      on && hardShadow(p, 'md'),
                      on && tilt(TILTS[i]),
                    ]}
                  >
                    <Moon phase={moodPhase(m)} size={36} />
                    <Text
                      numberOfLines={1}
                      style={[on ? TYPE.mark : TYPE.caption, { color: p.text }]}
                    >
                      {t(`review.mood.${m}` as MessageKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <TextField
          variant="note"
          label={t('review.note')}
          placeholder={t('review.notePlaceholder')}
          value={note}
          onChangeText={setNote}
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACE.lg }]}>
        <Button label={t(saved ? 'review.save' : 'review.close')} onPress={close} />
      </View>
    </View>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    fill: { flex: 1 },
    content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.block },
    section: { gap: 10 },
    plainRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 54,
      borderTopWidth: 1,
    },
    moods: { flexDirection: 'row', gap: SPACE.sm },
    mood: {
      flex: 1,
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACE.sm,
      paddingHorizontal: 2,
      borderWidth: STROKE.outline,
      borderRadius: RADIUS.md,
    },
    footer: { paddingHorizontal: SPACE.screenX, paddingTop: SPACE.sm },
  })
);
