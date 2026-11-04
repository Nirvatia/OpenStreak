import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { MoodFace } from './MoodFace';
import { todayStr, human, DAYN } from '../../utils/text';
import { isScheduled, isRest } from '../../utils/habits';
import { isPerfect } from '../../utils/moods';

export const ReviewHistorySheet: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const { reviewHistoryVisible, closeReviewHistory, openReview } = useUiStore();
  const showToast = useToastStore((s) => s.show);

  if (!reviewHistoryVisible) return null;

  const keys = Object.keys(state.moods).sort().reverse();
  const tb = todayStr();

  const handleOpen = (date: string) => {
    closeReviewHistory();
    if (!openReview(date)) {
      showToast('Этот день ещё не наступил');
    }
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={['80%']}
      enablePanDownToClose
      onClose={closeReviewHistory}
      backgroundStyle={{ backgroundColor: currentTheme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.line }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>История обзоров</Text>
        {keys.length === 0 ? (
          <Text style={[styles.empty, { color: currentTheme.colors.muted }]}>
            Обзоров пока нет — заполните первый на вкладке «Сегодня»
          </Text>
        ) : (
          keys.map((date) => {
            const m = state.moods[date];
            const dateLabel =
              date === tb
                ? 'Сегодня'
                : `${human(date)} · ${DAYN[new Date(date + 'T00:00').getDay()]}`;
            const scope = state.tasks.filter((x) => x.date === date);
            const done = scope.filter((x) => x.done).length;
            const scheduled = state.habits.filter((h) => isScheduled(h, date) && !isRest(h, date));
            const ok = scheduled.filter((h) =>
              h.type === 'bad' ? !h.dates.includes(date) : h.dates.includes(date)
            ).length;
            const perfect = isPerfect(date, state.habits, state.startedAt);

            return (
              <TouchableOpacity
                key={date}
                style={[styles.item, { backgroundColor: currentTheme.colors.card2 }]}
                onPress={() => handleOpen(date)}
                activeOpacity={0.7}
              >
                <View style={styles.itemTop}>
                  <Text style={[styles.itemDate, { color: currentTheme.colors.text }]}>
                    {dateLabel}
                  </Text>
                  <MoodFace mood={m.mood} size="sm" />
                </View>
                {m.note ? (
                  <Text
                    style={[styles.itemNote, { color: currentTheme.colors.muted }]}
                    numberOfLines={3}
                  >
                    {m.note}
                  </Text>
                ) : null}
                <View style={styles.itemStats}>
                  <Text style={[styles.itemStat, { color: currentTheme.colors.muted }]}>
                    Задачи:{' '}
                    <Text style={{ fontWeight: '700', color: currentTheme.colors.text }}>
                      {done}/{scope.length}
                    </Text>
                  </Text>
                  <Text style={[styles.itemStat, { color: currentTheme.colors.muted }]}>
                    Привычки:{' '}
                    <Text style={{ fontWeight: '700', color: currentTheme.colors.text }}>
                      {ok}/{scheduled.length}
                    </Text>
                  </Text>
                  {perfect ? (
                    <Text style={[styles.itemStat, { color: currentTheme.colors.muted }]}>
                      🌟 идеальный день
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  empty: {
    fontSize: 12.5,
    textAlign: 'center',
    paddingVertical: 24,
  },
  item: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemNote: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  itemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  itemStat: {
    fontSize: 12,
  },
});
