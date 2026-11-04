import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import {
  monthCells,
  weekCells,
  yearCells,
  monthTitle,
  weekTitle,
  CalendarView,
} from '../../utils/calendar';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { YearView } from './YearView';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

export const CalendarCard: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const areaFilter = useUiStore((s) => s.areaFilter);
  const { calView, calCursor, calSel, setView, navigatePrev, navigateNext, setSel, setCursor } =
    useCalendarStore();

  const cursorDate = new Date(calCursor + 'T00:00');

  let title = '';
  if (calView === 'month') title = monthTitle(cursorDate.getFullYear(), cursorDate.getMonth());
  else if (calView === 'week') title = weekTitle(calCursor);
  else title = String(cursorDate.getFullYear());

  const handleSelectMonth = (month: number) => {
    setCursor(`${cursorDate.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`);
    setView('month');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      {/* Одна строка: ‹ заголовок › | сегменты */}
      <View style={styles.head}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
          onPress={navigatePrev}
          activeOpacity={0.7}
        >
          <SvgIcon name="chevl" size={ICON_SIZES.svg.sm} color={currentTheme.colors.muted} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: currentTheme.colors.card2 }]}
          onPress={navigateNext}
          activeOpacity={0.7}
        >
          <SvgIcon name="chevr" size={ICON_SIZES.svg.sm} color={currentTheme.colors.muted} />
        </TouchableOpacity>
        <View style={[styles.seg, { backgroundColor: currentTheme.colors.card2 }]}>
          {(['week', 'month', 'year'] as CalendarView[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.segBtn,
                calView === v && { backgroundColor: currentTheme.colors.accent },
              ]}
              onPress={() => setView(v)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segText,
                  { color: currentTheme.colors.muted },
                  calView === v && { color: '#fff' },
                ]}
              >
                {{ week: 'нед', month: 'мес', year: 'год' }[v]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {calView === 'month' && (
        <MonthView
          cells={monthCells(
            cursorDate.getFullYear(),
            cursorDate.getMonth(),
            state.tasks,
            state.areas,
            areaFilter,
            calSel
          )}
          onSelectDate={setSel}
        />
      )}
      {calView === 'week' && (
        <WeekView
          cells={weekCells(calCursor, state.tasks, state.areas, areaFilter, calSel)}
          onSelectDate={setSel}
        />
      )}
      {calView === 'year' && (
        <YearView
          cells={yearCells(cursorDate.getFullYear(), state.tasks, state.areas, areaFilter)}
          onSelectMonth={handleSelectMonth}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  head: {
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
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seg: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  segBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default CalendarCard;
