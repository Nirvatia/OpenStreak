import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

type Props = { title: string; onPrev: () => void; onNext: () => void };

export const CalendarNav: React.FC<Props> = ({ title, onPrev, onNext }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: currentTheme.colors.card2 }]}
        onPress={onPrev}
        activeOpacity={0.7}
      >
        <SvgIcon name="chevl" size={ICON_SIZES.svg.md} color={currentTheme.colors.muted} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: currentTheme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: currentTheme.colors.card2 }]}
        onPress={onNext}
        activeOpacity={0.7}
      >
        <SvgIcon name="chevr" size={ICON_SIZES.svg.md} color={currentTheme.colors.muted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { flex: 1, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
});

export default CalendarNav;
