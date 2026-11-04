import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { daysUsed } from '../../utils/goals';
import { human, plural } from '../../utils/text';
import { AppIcon } from '../icons/AppIcon';

export const CountdownHero: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const startedAt = useAppStore((s) => s.state.startedAt);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const su = daysUsed(startedAt);
  const ac1 = currentTheme.colors.accent;
  const ac2 = currentTheme.colors.accent2 || currentTheme.colors.accent;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.w === Math.round(width) && prev.h === Math.round(height)
        ? prev
        : { w: Math.round(width), h: Math.round(height) }
    );
  };

  return (
    <View style={[styles.hero, { backgroundColor: ac1 }]} onLayout={onLayout}>
      {size.w > 0 && size.h > 0 && (
        <Svg width={size.w} height={size.h} style={styles.bg} pointerEvents="none">
          <Defs>
            <LinearGradient id="cdHeroGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={ac1} />
              <Stop offset="1" stopColor={ac2} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.w} height={size.h} fill="url(#cdHeroGrad)" />
        </Svg>
      )}
      <View style={styles.content}>
        <Text style={styles.num}>{su}</Text>
        <View style={styles.textWrap}>
          <Text style={styles.bold} numberOfLines={2}>
            {plural(su, 'день', 'дня', 'дней')} с OpenStreak
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            вы начали {human(startedAt)}
          </Text>
        </View>
        <View style={styles.rocketWrap}>
          <AppIcon name="rocket" sizeClass="lg" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
  },
  bg: { position: 'absolute', top: 0, left: 0 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 1 },
  num: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  textWrap: { flex: 1, flexShrink: 1 },
  bold: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  rocketWrap: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
});
