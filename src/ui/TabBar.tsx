/**
 * Таб-бар «Штампа»: чёрная полоса, иконка и подпись капсом; активная вкладка —
 * светлым цветом и чертой цвета печати сверху. Высота — 64 + нижний отступ системы.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

export type TabItem<K extends string> = { key: K; label: string; icon: UiIconName };

type Props<K extends string> = {
  items: TabItem<K>[];
  active: K;
  onSelect: (key: K) => void;
  /** название навигации для чтения с экрана */
  label?: string;
};

export const TAB_BAR_HEIGHT = 64;

export function TabBar<K extends string>({ items, active, onSelect, label }: Props<K>) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[
        styles.bar,
        {
          backgroundColor: p.nav,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {items.map((it) => {
        const on = it.key === active;
        const color = on ? p.navText : p.navMuted;
        return (
          <Pressable
            key={it.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(it.key)}
            style={styles.item}
          >
            {on && <View style={[styles.mark, { backgroundColor: p.navMark }]} />}
            <Icon name={it.icon} size={24} color={color} />
            <Text style={[TYPE.tab, { color }]} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  mark: { position: 'absolute', top: 6, width: 28, height: 3 },
});
