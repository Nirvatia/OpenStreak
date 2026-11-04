/**
 * Навигация «Мульта»: вкладки Сегодня · Дела · Привычки · Цели · Стая (свой таб-бар из src/ui)
 * и экраны поверх вкладок (настройки; позже — карточка привычки, итог дня).
 *
 * Пока экраны «Привычки», «Цели» и «Стая» не перенесены на «Мульт», на их вкладках
 * открываются старые экраны (Привычки, Отсчёт, Статистика).
 */
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { TasksScreen } from '../features/tasks/TasksScreen';
import { TodayScreen } from '../features/today/TodayScreen';
import { CountdownScreen } from '../screens/CountdownScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { TabBar, type TabItem } from '../ui/TabBar';

export type TabKey = 'today' | 'tasks' | 'habits' | 'goals' | 'pack';
export type RootStack = { tabs: undefined; settings: undefined };

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStack>();

function LunaTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const items: TabItem<TabKey>[] = (['today', 'tasks', 'habits', 'goals', 'pack'] as const).map(
    (key) => ({ key, label: t(`tab.${key}`), icon: key })
  );
  return (
    <TabBar
      items={items}
      active={state.routes[state.index].name as TabKey}
      onSelect={(key) => navigation.navigate(key)}
    />
  );
}

function Tabs({ navigation }: NativeStackScreenProps<RootStack, 'tabs'>) {
  const p = usePalette();
  return (
    <Tab.Navigator
      tabBar={(props) => <LunaTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: p.bg } }}
    >
      <Tab.Screen name="today">
        {() => <TodayScreen onOpenSettings={() => navigation.navigate('settings')} />}
      </Tab.Screen>
      <Tab.Screen name="tasks" component={TasksScreen} />
      <Tab.Screen name="habits" component={HabitsScreen} />
      <Tab.Screen name="goals" component={CountdownScreen} />
      <Tab.Screen name="pack" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const p = usePalette();
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg } }}
    >
      <Stack.Screen name="tabs" component={Tabs} />
      <Stack.Screen name="settings">
        {({ navigation }) => <SettingsScreen onBack={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
