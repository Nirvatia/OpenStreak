import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatCards } from '../components/stats/StatCards';
import { ActivityChart } from '../components/stats/ActivityChart';
import { MoodCalendar } from '../components/stats/MoodCalendar';
import { PerfectCalendar } from '../components/stats/PerfectCalendar';
import { ProfileSection } from '../components/stats/ProfileSection';
import { SvgIcon } from '../components/icons/SvgIcon';
import { ICON_SIZES } from '../theme/iconSizes';

export const StatsScreen: React.FC = () => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const insets = useSafeAreaInsets();

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
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>Статистика</Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>
              последние 7 дней
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
        <StatCards />
        <ActivityChart />
        <MoodCalendar />
        <PerfectCalendar />
        <ProfileSection />
      </ScrollView>
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
});
