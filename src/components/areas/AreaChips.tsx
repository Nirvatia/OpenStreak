import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { HabitIcon } from '../icons/HabitIcon';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

type Props = { variant?: 'tasks' | 'habits' };

export const AreaChips: React.FC<Props> = ({ variant = 'tasks' }) => {
  const { currentTheme } = useThemeStore();
  const state = useAppStore((s) => s.state);
  const { areaFilter, setAreaFilter, habAreaFilter, setHabAreaFilter, openAreasSheet } =
    useUiStore();

  const current = variant === 'habits' ? habAreaFilter : areaFilter;
  const setCurrent = variant === 'habits' ? setHabAreaFilter : setAreaFilter;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
          current === null && {
            backgroundColor: currentTheme.colors.accent,
            borderColor: currentTheme.colors.accent,
          },
        ]}
        onPress={() => setCurrent(null)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.chipText,
            { color: currentTheme.colors.text },
            current === null && { color: '#fff' },
          ]}
        >
          Все
        </Text>
      </TouchableOpacity>

      {state.areas.map((area) => (
        <TouchableOpacity
          key={area.id}
          style={[
            styles.chip,
            { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
            current === area.id && { backgroundColor: area.color, borderColor: area.color },
          ]}
          onPress={() => setCurrent(area.id)}
          activeOpacity={0.8}
        >
          <HabitIcon name={area.icon} size={ICON_SIZES.habit.sm} />
          <Text
            style={[
              styles.chipText,
              { color: currentTheme.colors.text },
              current === area.id && { color: '#fff' },
            ]}
          >
            {area.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.chip,
          styles.addChip,
          { borderColor: currentTheme.colors.line, backgroundColor: currentTheme.colors.card },
        ]}
        onPress={openAreasSheet}
        activeOpacity={0.8}
      >
        <SvgIcon name="plus" size={ICON_SIZES.svg.md} color={currentTheme.colors.accent} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  content: { gap: 8, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  addChip: { paddingHorizontal: 12 },
  chipText: { fontSize: 13, fontWeight: '600' },
});
