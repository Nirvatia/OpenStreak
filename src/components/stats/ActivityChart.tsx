import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { last7, activityPerDay } from '../../utils/stats';
import { DAYN2, todayStr } from '../../utils/text';

/** Высота зоны столбиков. Всё остальное в карточке — подписи и отступы —
 *  лежит вне её, поэтому столбик физически не может выйти за границы блока. */
const BAR_AREA = 96;
/** Заглушка для дня без активности — тонкая полоска вместо пустоты. */
const MIN_BAR = 4;

export const ActivityChart: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const days = last7();
  const tb = todayStr();

  const max = Math.max(1, ...days.map((d) => activityPerDay(d, state.tasks, state.habits)));

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>Активность за неделю</Text>
      <View style={styles.chart}>
        {days.map((d) => {
          const activity = activityPerDay(d, state.tasks, state.habits);
          // Высота в пунктах внутри фиксированной зоны BAR_AREA:
          // процент от колонки шёл вместе с подписями и выходил за край карточки.
          const height = activity ? Math.max(8, Math.round((activity / max) * BAR_AREA)) : MIN_BAR;
          const dow = DAYN2[new Date(d + 'T00:00').getDay()];
          const isToday = d === tb;
          const hasActivity = activity > 0;

          return (
            <View key={d} style={styles.column}>
              <Text style={[styles.value, { color: currentTheme.colors.muted }]}>
                {activity || ''}
              </Text>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: hasActivity
                        ? currentTheme.colors.accent
                        : currentTheme.colors.card2,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.day,
                  { color: currentTheme.colors.muted },
                  isToday && { color: currentTheme.colors.accent },
                ]}
              >
                {dow}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    paddingLeft: 4,
  },
  chart: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    minHeight: 14,
  },
  /** Зона, в которой живёт столбик. Подписи снаружи — поэтому они больше не наезжают. */
  barArea: {
    width: '100%',
    height: BAR_AREA,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 30,
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  day: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 13,
  },
});
