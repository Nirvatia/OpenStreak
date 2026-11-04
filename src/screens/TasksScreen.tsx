import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useCalendarStore } from '../store/calendarStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchInput } from '../components/tasks/SearchInput';
import { QuickTaskInput } from '../components/tasks/QuickTaskInput';
import { TaskList } from '../components/tasks/TaskList';
import { TaskGroup } from '../components/tasks/TaskGroup';
import { AreaChips } from '../components/areas/AreaChips';
import { CalendarCard } from '../components/calendar/CalendarCard';
import { DayPanel } from '../components/calendar/DayPanel';
import { Fab } from '../components/ui/Fab';
import { SvgIcon } from '../components/icons/SvgIcon';
import { ICON_SIZES } from '../theme/iconSizes';
import { isNoDate, isDone } from '../utils/tasks';
import { plural } from '../utils/text';

export const TasksScreen: React.FC = () => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const showDone = useUiStore((s) => s.showDone);
  const toggleShowDone = useUiStore((s) => s.toggleShowDone);
  const areaFilter = useUiStore((s) => s.areaFilter);
  const openAreasSheet = useUiStore((s) => s.openAreasSheet);
  const calSel = useCalendarStore((s) => s.calSel);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const byArea = (x: { area: string | null }) => !areaFilter || x.area === areaFilter;
  const byQuery = (x: { title: string }) =>
    !query || x.title.toLowerCase().includes(query.toLowerCase());
  const noDate = state.tasks.filter((x) => isNoDate(x) && byArea(x) && byQuery(x));
  const sortedDone = state.tasks
    .filter((x) => isDone(x) && byArea(x) && byQuery(x))
    .sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  const activeCount = state.tasks.filter((x) => !x.done && byArea(x)).length;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.bg }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: currentTheme.colors.bg },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>Задачи</Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>
              {activeCount > 0
                ? `${activeCount} ${plural(activeCount, 'активная', 'активные', 'активных')}`
                : 'всё сделано'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={openAreasSheet}
              style={[styles.iconButton, { backgroundColor: currentTheme.colors.card }]}
              activeOpacity={0.8}
            >
              <SvgIcon name="layers" size={ICON_SIZES.svg.md} color={currentTheme.colors.text} />
            </TouchableOpacity>
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
        keyboardShouldPersistTaps="handled"
      >
        <SearchInput value={query} onChangeText={setQuery} />
        <QuickTaskInput presetDate={calSel} />
        <AreaChips />
        <CalendarCard />
        <DayPanel />
        {noDate.length > 0 && (
          <TaskGroup label="Без даты" count={noDate.length}>
            <TaskList tasks={noDate} />
          </TaskGroup>
        )}
        {sortedDone.length > 0 && (
          <TaskGroup
            label="Завершённые"
            count={sortedDone.length}
            collapsible
            collapsed={!showDone}
            onToggle={toggleShowDone}
          >
            <TaskList tasks={sortedDone} />
          </TaskGroup>
        )}
      </ScrollView>
      <Fab />
    </View>
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
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: {
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
});
