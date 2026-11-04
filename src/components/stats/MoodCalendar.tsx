import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { FaceIcon } from '../icons/FaceIcon';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';
import { last7, addDays, monthTitle, DAYN2, todayStr } from '../../utils/text';

type MoodView = 'week' | 'month';

const DOW_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export const MoodCalendar: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const openReview = useUiStore((s) => s.openReview);
  const showToast = useToastStore((s) => s.show);
  const [view, setView] = useState<MoodView>('week');
  const [cursor, setCursor] = useState(todayStr());
  const tb = todayStr();

  const handleDayTap = (date: string) => {
    if (date > tb) {
      showToast('Этот день ещё не наступил');
      return;
    }
    if (!openReview(date)) showToast('Этот день ещё не наступил');
  };

  const navigate = (dir: number) => {
    const dt = new Date(cursor + 'T00:00');
    dt.setMonth(dt.getMonth() + dir);
    setCursor(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    );
  };

  const renderWeek = () => {
    const days = last7();
    return (
      <View style={styles.weekRow}>
        {days.map((d) => {
          const mood = state.moods[d];
          const dow = DAYN2[new Date(d + 'T00:00').getDay()];
          const isToday = d === tb;
          return (
            <TouchableOpacity
              key={d}
              style={styles.weekCol}
              onPress={() => handleDayTap(d)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.weekCell,
                  isToday && { backgroundColor: currentTheme.colors.accentSoft },
                ]}
              >
                {mood ? (
                  <FaceIcon mood={mood.mood} sizeClass="sm" />
                ) : (
                  <Text style={[styles.dot, { color: currentTheme.colors.muted }]}>·</Text>
                )}
              </View>
              <Text
                style={[
                  styles.dow,
                  { color: currentTheme.colors.muted },
                  isToday && { color: currentTheme.colors.accent },
                ]}
              >
                {dow}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderMonth = () => {
    const dt = new Date(cursor + 'T00:00');
    const y = dt.getFullYear();
    const m = dt.getMonth();
    const firstDay = new Date(y, m, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const startDate = addDays(`${y}-${String(m + 1).padStart(2, '0')}-01`, -startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(startDate, i);
      const mood = state.moods[d];
      const cellDate = new Date(d + 'T00:00');
      const isOtherMonth = cellDate.getMonth() !== m;
      const isFuture = d > tb;
      const isToday = d === tb;
      cells.push(
        <TouchableOpacity
          key={`${d}-${i}`}
          style={[
            styles.cell,
            isOtherMonth && { opacity: 0.3 },
            isFuture && { opacity: 0.35 },
            isToday && { backgroundColor: currentTheme.colors.accentSoft },
          ]}
          onPress={() => handleDayTap(d)}
          activeOpacity={0.7}
        >
          {mood ? (
            <FaceIcon mood={mood.mood} sizeClass="md" />
          ) : (
            <Text style={[styles.dot, { color: currentTheme.colors.muted }]}>·</Text>
          )}
        </TouchableOpacity>
      );
    }
    return (
      <View>
        <View style={styles.nav}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
            onPress={() => navigate(-1)}
            activeOpacity={0.7}
          >
            <SvgIcon name="chevl" size={ICON_SIZES.svg.md} color={currentTheme.colors.muted} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: currentTheme.colors.text }]}>
            {monthTitle(y, m)}
          </Text>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
            onPress={() => navigate(1)}
            activeOpacity={0.7}
          >
            <SvgIcon name="chevr" size={ICON_SIZES.svg.md} color={currentTheme.colors.muted} />
          </TouchableOpacity>
        </View>
        <View style={styles.dowRow}>
          {DOW_LABELS.map((d) => (
            <View key={d} style={styles.dowCol}>
              <Text style={[styles.dow, { color: currentTheme.colors.muted }]}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={styles.grid}>{cells}</View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Настроение</Text>
        <View style={[styles.seg, { backgroundColor: currentTheme.colors.card2 }]}>
          <TouchableOpacity
            style={[
              styles.segBtn,
              view === 'week' && { backgroundColor: currentTheme.colors.accent },
            ]}
            onPress={() => setView('week')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segText,
                { color: currentTheme.colors.muted },
                view === 'week' && { color: '#fff' },
              ]}
            >
              нед
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segBtn,
              view === 'month' && { backgroundColor: currentTheme.colors.accent },
            ]}
            onPress={() => setView('month')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segText,
                { color: currentTheme.colors.muted },
                view === 'month' && { color: '#fff' },
              ]}
            >
              мес
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {view === 'week' ? renderWeek() : renderMonth()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 14,
    paddingBottom: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  title: { flex: 1, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  seg: { flexDirection: 'row', borderRadius: 10, padding: 2, gap: 2 },
  /* Увеличен паддинг: было 9 — текст «нед»/«мес» обрезался */
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: { fontSize: 11, fontWeight: '700' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: { flex: 1, fontSize: 14, fontWeight: '800', letterSpacing: -0.2, textAlign: 'center' },
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowCol: { flex: 1, alignItems: 'center' },
  dow: { fontSize: 10, fontWeight: '700' },
  weekRow: { flexDirection: 'row', paddingVertical: 4 },
  weekCol: { flex: 1, alignItems: 'center', gap: 6 },
  weekCell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: { fontSize: 22, opacity: 0.35 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.2857%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
});
