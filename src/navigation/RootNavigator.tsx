/**
 * Навигация «Мульта»: вкладки Сегодня · Дела · Привычки · Цели · Стая (свой таб-бар из src/ui)
 * и экраны поверх вкладок: карточка привычки, итог дня, «День закрыт», настройки.
 */
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { AreasScreen } from '../features/areas/AreasScreen';
import { GoalsScreen } from '../features/goals/GoalsScreen';
import { HabitScreen } from '../features/habits/HabitScreen';
import { HabitsScreen } from '../features/habits/HabitsScreen';
import { PackScreen } from '../features/pack/PackScreen';
import { StatsScreen } from '../features/stats/StatsScreen';
import { PlacesScreen } from '../features/places/PlacesScreen';
import { ClosedScreen } from '../features/review/ClosedScreen';
import { ReviewScreen } from '../features/review/ReviewScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { TasksScreen } from '../features/tasks/TasksScreen';
import { TodayScreen } from '../features/today/TodayScreen';
import { useT } from '../store/prefsStore';
import { usePalette, usePlain } from '../store/themeStore';
import { TabBar, type TabItem } from '../ui/TabBar';

export type TabKey = 'today' | 'tasks' | 'habits' | 'goals' | 'pack';
export type RootStack = {
  tabs: undefined;
  settings: undefined;
  places: undefined;
  areas: undefined;
  habit: { id: string };
  review: undefined;
  closed: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStack>();

function LunaTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const plain = usePlain();
  const items: TabItem<TabKey>[] = (['today', 'tasks', 'habits', 'goals', 'pack'] as const).map(
    (key) =>
      // «Обычный»: вместо «Стаи» — «Итоги» (обычная статистика, без рейтинга).
      key === 'pack' && plain
        ? { key, label: t('tab.stats'), icon: 'stats' }
        : { key, label: t(`tab.${key}`), icon: key }
  );
  return (
    <TabBar
      items={items}
      active={state.routes[state.index].name as TabKey}
      onSelect={(key) => navigation.navigate(key)}
    />
  );
}

/** «Обычный» — «Итоги» (статистика), «АУФ» — «Стая» (звания и волк). */
function PackOrStats() {
  return usePlain() ? <StatsScreen /> : <PackScreen />;
}

function Tabs({ navigation }: NativeStackScreenProps<RootStack, 'tabs'>) {
  const p = usePalette();
  return (
    <Tab.Navigator
      tabBar={(props) => <LunaTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: p.bg } }}
    >
      <Tab.Screen name="today">
        {() => (
          <TodayScreen
            onOpenSettings={() => navigation.navigate('settings')}
            onOpenReview={() => navigation.navigate('review')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="tasks" component={TasksScreen} />
      <Tab.Screen name="habits">
        {() => <HabitsScreen onOpen={(id) => navigation.navigate('habit', { id })} />}
      </Tab.Screen>
      <Tab.Screen name="goals" component={GoalsScreen} />
      <Tab.Screen name="pack" component={PackOrStats} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const p = usePalette();
  // Без затухания и вспышек между экранами (a11y); при «уменьшить движение» — без анимации.
  const reduce = useReducedMotion();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: p.bg },
        animation: reduce ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="tabs" component={Tabs} />
      <Stack.Screen name="habit">
        {({ navigation, route }) => (
          <HabitScreen habitId={route.params.id} onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="review">
        {({ navigation }) => (
          <ReviewScreen
            onBack={() => navigation.goBack()}
            onClosed={() => navigation.replace('closed')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="closed">
        {({ navigation }) => <ClosedScreen onDone={() => navigation.popToTop()} />}
      </Stack.Screen>
      <Stack.Screen name="settings">
        {({ navigation }) => (
          <SettingsScreen
            onBack={() => navigation.goBack()}
            onOpenPlaces={() => navigation.navigate('places')}
            onOpenAreas={() => navigation.navigate('areas')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="areas">
        {({ navigation }) => <AreasScreen onBack={() => navigation.goBack()} />}
      </Stack.Screen>
      <Stack.Screen name="places">
        {({ navigation }) => <PlacesScreen onBack={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
