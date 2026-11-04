import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useToastStore } from '../store/toastStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountdownHero } from '../components/goals/CountdownHero';
import { GoalCard } from '../components/goals/GoalCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Fab } from '../components/ui/Fab';
import { SvgIcon } from '../components/icons/SvgIcon';
import { ICON_SIZES } from '../theme/iconSizes';
import { deadlineGoals } from '../utils/goals';

export const CountdownScreen: React.FC = () => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const areas = useAppStore((s) => s.state.areas);
  const openGoalSheet = useUiStore((s) => s.openGoalSheet);
  const showToast = useToastStore((s) => s.show);
  const insets = useSafeAreaInsets();
  const goals = deadlineGoals(areas);

  const handleAdd = () => {
    if (!areas.length) {
      showToast('Сначала создайте сферу');
      return;
    }
    openGoalSheet({ requireDeadline: true });
  };

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
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>Отсчёт</Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>
              дедлайны целей
            </Text>
          </View>
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <CountdownHero />
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: currentTheme.colors.muted }]}>Дедлайны целей</Text>
          <View style={[styles.count, { backgroundColor: currentTheme.colors.card2 }]}>
            <Text style={[styles.countText, { color: currentTheme.colors.muted }]}>
              {goals.length}
            </Text>
          </View>
        </View>
        {goals.length === 0 ? (
          <EmptyState
            emoji="target"
            title="Нет целей с дедлайном"
            text="Добавьте цель с датой, чтобы видеть её здесь"
          />
        ) : (
          goals.map((g) => <GoalCard key={g.id} goal={g} />)
        )}
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: currentTheme.colors.line }]}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <SvgIcon name="plus" size={ICON_SIZES.svg.md} color={currentTheme.colors.muted} />
          <Text style={[styles.addText, { color: currentTheme.colors.muted }]}>
            Добавить цель с дедлайном
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Fab onPress={handleAdd} />
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 4,
  },
  label: { fontSize: 13, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  count: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 1 },
  countText: { fontSize: 12, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 16,
    padding: 15,
    marginTop: 8,
  },
  addText: { fontSize: 14, fontWeight: '600' },
});
