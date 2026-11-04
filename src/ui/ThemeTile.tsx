/**
 * Плитка выбора темы (design/luna/L-Settings): миниатюра палитры и подпись.
 * «Как в системе» — две половины: Ночь и Рассвет. Выбранная — толстой рамкой.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { resolvePalette, type Scheme } from '../theme/palette';
import { LINE, SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';

type Props = {
  label: string;
  /** какие палитры показать в миниатюре */
  schemes: Scheme[];
  selected: boolean;
  onPress: () => void;
};

const TILE_HEIGHT = 92;
const DOT = 10;

export function ThemeTile({ label, schemes, selected, onPress }: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: p.surface,
          borderWidth: selected ? LINE.bold : LINE.hair,
          borderColor: selected ? p.text : p.line,
        },
      ]}
    >
      <View style={styles.preview}>
        {schemes.map((s) => {
          const c = resolvePalette(s);
          return (
            <View key={s} style={[styles.half, { backgroundColor: c.bg }]}>
              <View style={styles.line}>
                <View style={[styles.dot, { backgroundColor: c.text }]} />
                <View style={[styles.bar, styles.long, { backgroundColor: c.text }]} />
              </View>
              <View style={styles.line}>
                <View style={[styles.dot, styles.ring, { borderColor: c.muted }]} />
                <View style={[styles.bar, styles.short, { backgroundColor: c.muted }]} />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={[TYPE.mark, styles.label, { color: p.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, height: TILE_HEIGHT, overflow: 'hidden' },
  preview: { flex: 1, flexDirection: 'row' },
  half: { flex: 1, justifyContent: 'center', gap: 5, paddingHorizontal: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: SPACE.tight },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  ring: { borderWidth: 1.5 },
  bar: { height: 4, flex: 1 },
  long: { maxWidth: 46 },
  short: { maxWidth: 32 },
  label: { paddingVertical: SPACE.tight, paddingHorizontal: SPACE.sm },
});
