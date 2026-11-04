import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodayScreen } from '../screens/TodayScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { CountdownScreen } from '../screens/CountdownScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { useThemeStore } from '../store/themeStore';
import { SvgIcon, SystemIconName } from '../components/icons';
import { ICON_SIZES } from '../theme/iconSizes';
import { TABS, TabKey } from '../constants/tabs';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<TabKey, SystemIconName> = {
  today: 'nToday',
  tasks: 'nTasks',
  habits: 'nHab',
  count: 'nCount',
  stats: 'nStats',
};

export const RootTabs: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.navBg,
          borderTopColor: currentTheme.colors.line,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          height: 68 + insets.bottom,
        },
        tabBarActiveTintColor: currentTheme.colors.accent,
        tabBarInactiveTintColor: currentTheme.colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color }) => (
          <SvgIcon
            name={TAB_ICONS[route.name as TabKey]}
            size={ICON_SIZES.containers.tabIcon}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="today" component={TodayScreen} options={{ title: TABS.today }} />
      <Tab.Screen name="tasks" component={TasksScreen} options={{ title: TABS.tasks }} />
      <Tab.Screen name="habits" component={HabitsScreen} options={{ title: TABS.habits }} />
      <Tab.Screen name="count" component={CountdownScreen} options={{ title: TABS.count }} />
      <Tab.Screen name="stats" component={StatsScreen} options={{ title: TABS.stats }} />
    </Tab.Navigator>
  );
};
