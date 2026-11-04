import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../store/themeStore';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitCard } from '../components/habits/HabitCard';
import { AreaChips } from '../components/areas/AreaChips';
import { EmptyState } from '../components/ui/EmptyState';
import { Fab } from '../components/ui/Fab';
import { SvgIcon } from '../components/icons/SvgIcon';
import { ICON_SIZES } from '../theme/iconSizes';
import { Habit } from '../types/models';
import { plural, todayStr } from '../utils/text';
import { isRest } from '../utils/habits';

export const HabitsScreen: React.FC = () => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const habAreaFilter = useUiStore((s) => s.habAreaFilter);
  const openAreasSheet = useUiStore((s) => s.openAreasSheet);
  const openHabitSheet = useUiStore((s) => s.openHabitSheet);
  const insets = useSafeAreaInsets();

  const n = state.habits.length;
  const subtitle = n ? `${n} ${plural(n, 'привычка', 'привычки', 'привычек')}` : 'пока пусто';

  const tb = todayStr();
  const weight = (h: Habit) => (isRest(h, tb) ? 2 : h.dates.includes(tb) ? 1 : 0);
  const filtered = state.habits.filter((h) => !habAreaFilter || h.area === habAreaFilter);
  const sorted = filtered.slice().sort((a, b) => weight(a) - weight(b));

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
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>Привычки</Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>{subtitle}</Text>
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
      >
        {state.areas.length > 0 && <AreaChips variant="habits" />}
        {n === 0 ? (
          <EmptyState
            emoji="sprout"
            title="Привычек пока нет"
            text="Создайте полезную или вредную привычку — маленькие шаги ведут к большим целям"
          />
        ) : (
          sorted.map((h) => <HabitCard key={h.id} habit={h} />)
        )}
      </ScrollView>

      <Fab onPress={() => openHabitSheet()} />
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
