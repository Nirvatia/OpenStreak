import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../store/themeStore';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storage, TIP_KEY } from '../services/storage';
import { QuickTaskInput } from '../components/tasks/QuickTaskInput';
import { TaskList } from '../components/tasks/TaskList';
import { TaskGroup } from '../components/tasks/TaskGroup';
import { QuoteCard } from '../components/QuoteCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AreaChips } from '../components/areas/AreaChips';
import { HabitCard } from '../components/habits/HabitCard';
import { ReviewCard } from '../components/review/ReviewCard';
import { Fab } from '../components/ui/Fab';
import { SvgIcon } from '../components/icons/SvgIcon';
import { AppIcon } from '../components/icons/AppIcon';
import { ICON_SIZES } from '../theme/iconSizes';
import { useToastStore } from '../store/toastStore';
import { DAYN, human } from '../utils/dates';
import { plural, todayStr } from '../utils/text';
import { sortByPriority, isOverdue, isToday } from '../utils/tasks';
import { isScheduled, isRest } from '../utils/habits';

export const TodayScreen: React.FC = () => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const areaFilter = useUiStore((s) => s.areaFilter);
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const tb = todayStr();
  const now = new Date();
  const h = now.getHours();
  const greet =
    h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  const dayName = DAYN[now.getDay()];
  const dayTitle = dayName[0].toUpperCase() + dayName.slice(1);
  const filterFn = (x: any) => !areaFilter || x.area === areaFilter;
  const allToday = state.tasks.filter((x) => x.date === tb && filterFn(x));
  const scope = allToday.filter((x) => !x.done);
  const overdue = state.tasks.filter((x) => isOverdue(x) && filterFn(x));
  const todayTasks = scope.filter(isToday);
  const pT = allToday.length ? (allToday.length - scope.length) / allToday.length : 0;
  const schedH = state.habits.filter((x) => isScheduled(x, tb) && !isRest(x, tb));
  const okH = schedH.filter((x) =>
    x.type === 'bad' ? !x.dates.includes(tb) : x.dates.includes(tb)
  ).length;
  const pH = schedH.length ? okH / schedH.length : 0;
  const allTodayHabits = state.habits.filter((x) => isScheduled(x, tb));
  const activeHabits = allTodayHabits.filter((x) => !isRest(x, tb) && !x.dates.includes(tb));
  const subtitle = allToday.length
    ? `${human(tb)} · ${allToday.length - scope.length} из ${allToday.length} ${plural(allToday.length, 'задачи', 'задач', 'задач')}`
    : `${human(tb)} · нет задач на сегодня`;
  const hasAnyTasksInApp = state.tasks.length > 0 || state.habits.length > 0;
  const hasNoActiveToday =
    todayTasks.length === 0 &&
    overdue.length === 0 &&
    activeHabits.length === 0 &&
    allTodayHabits.length === 0;

  useEffect(() => {
    (async () => {
      const tipShown = await storage.getString(TIP_KEY);
      if (!tipShown) {
        setTimeout(() => {
          showToast('Корзинка или свайп влево — удалить задачу');
          storage.setString(TIP_KEY, '1');
        }, 2600);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: currentTheme.colors.bg }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: currentTheme.colors.bg },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.eyebrow, { color: currentTheme.colors.accent }]}>{greet}</Text>
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>{dayTitle}</Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>{subtitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <ProgressRing
              progress={pT}
              size={58}
              strokeWidth={6}
              color={currentTheme.colors.accent}
              trackColor={currentTheme.colors.card2}
              textColor={currentTheme.colors.text}
            />
            <ProgressRing
              progress={pH}
              size={58}
              strokeWidth={6}
              color={currentTheme.colors.accent}
              trackColor={currentTheme.colors.card2}
              textColor={currentTheme.colors.text}
            />
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: currentTheme.colors.card }]}
              activeOpacity={0.8}
            >
              <SvgIcon
                name={theme === 'light' ? 'moon' : 'sun'}
                size={ICON_SIZES.svg.md}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <QuickTaskInput />
        <ReviewCard />
        <QuoteCard />

        {activeHabits.length > 0 && (
          <TaskGroup label="Привычки на сегодня" count={activeHabits.length}>
            {activeHabits.map((x) => (
              <HabitCard key={x.id} habit={x} compact />
            ))}
          </TaskGroup>
        )}

        {activeHabits.length === 0 && allTodayHabits.length > 0 && (
          <View style={styles.restNoteRow}>
            <Text style={[styles.restNote, { color: currentTheme.colors.muted }]}>
              Все привычки на сегодня выполнены
            </Text>
            <SvgIcon name="check" size={ICON_SIZES.svg.sm} color={currentTheme.colors.green} />
          </View>
        )}

        {allTodayHabits.length === 0 && state.habits.length > 0 && (
          <View style={styles.restNoteRow}>
            <Text style={[styles.restNote, { color: currentTheme.colors.muted }]}>
              Сегодня у всех привычек выходной
            </Text>
            <AppIcon name="relief" sizeClass="xs" />
          </View>
        )}

        <AreaChips />

        {!hasAnyTasksInApp && (
          <EmptyState
            emoji="hello"
            title="Добро пожаловать в OpenStreak"
            text="Добавьте первую задачу или привычку кнопкой «+» — всё хранится на вашем устройстве"
          />
        )}

        {hasAnyTasksInApp && hasNoActiveToday && (
          <EmptyState
            emoji="relief"
            title="Сегодня свободно"
            text="Можно отдохнуть или добавить новую задачу"
          />
        )}

        {overdue.length > 0 && (
          <TaskGroup label="Просрочено" count={overdue.length} color="#ef4444">
            <TaskList tasks={sortByPriority(overdue)} />
          </TaskGroup>
        )}

        {todayTasks.length > 0 && (
          <TaskGroup label="Сегодня" count={todayTasks.length}>
            <TaskList tasks={sortByPriority(todayTasks)} />
          </TaskGroup>
        )}
      </ScrollView>
      <Fab />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrow: { fontSize: 12.5, fontWeight: '600', letterSpacing: 0.4, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, lineHeight: 32 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 6 },
  restNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 12,
  },
  restNote: { fontSize: 12.5, fontWeight: '500', textAlign: 'center' },
});
