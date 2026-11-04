/**
 * Плитка выбора темы (design/mult, M-Settings): миниатюра палитры (луна и наклейка) и подпись.
 * «Как в системе» — две половины: День и Вечер. Выбранная — с тенью, под углом, подпись жёлтая.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../theme/metrics';
import { resolvePalette, type Scheme } from '../theme/palette';
import { hardShadow, tilt } from '../theme/sticker';
import { TYPE } from '../theme/type';

type Props = {
  label: string;
  /** какие палитры показать в миниатюре */
  schemes: Scheme[];
  selected: boolean;
  onPress: () => void;
  /** наклон выбранной плитки в градусах */
  lean?: number;
};

const TILE_HEIGHT = 96;

export function ThemeTile({ label, schemes, selected, onPress, lean = -2 }: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: p.surface, borderColor: p.line },
        selected && hardShadow(p, 'md'),
        selected && tilt(lean),
      ]}
    >
      <View style={styles.preview}>
        {schemes.map((s) => {
          const c = resolvePalette(s);
          return (
            <View key={s} style={[styles.half, { backgroundColor: c.bg }]}>
              <View style={[styles.moon, { backgroundColor: c.sun, borderColor: c.line }]} />
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]} />
            </View>
          );
        })}
      </View>
      <Text
        numberOfLines={1}
        style={[
          TYPE.mark,
          styles.label,
          { borderTopColor: p.line },
          selected
            ? { backgroundColor: p.sun, color: p.onSun }
            : { backgroundColor: p.surface, color: p.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: TILE_HEIGHT,
    overflow: 'hidden',
    borderWidth: STROKE.outline,
    borderRadius: RADIUS.md,
  },
  preview: { flex: 1, flexDirection: 'row' },
  half: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.tight,
  },
  moon: { width: 18, height: 18, borderRadius: 9, borderWidth: STROKE.thin },
  card: { width: 22, height: 12, borderRadius: 4, borderWidth: STROKE.thin },
  label: {
    paddingVertical: SPACE.tight,
    paddingHorizontal: SPACE.xs,
    borderTopWidth: STROKE.outline,
  },
});
