/**
 * Таб-бар «Луны»: подложка surface, гранёная иконка и подпись; активная вкладка — лунным
 * светом и чертой сверху, остальные приглушены. Высота — 58 + нижний отступ системы.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePalette } from '../store/themeStore';
import { LINE, SIZE } from '../theme/metrics';
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
          backgroundColor: p.surface,
          borderTopColor: p.line,
          height: SIZE.tabBar + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable
            key={it.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(it.key)}
            style={styles.item}
          >
            {on && <View style={[styles.mark, { backgroundColor: p.text }]} />}
            <Icon name={it.icon} size={22} tone={on ? 'text' : 'muted'} />
            <Text style={[TYPE.tab, { color: on ? p.text : p.muted }]} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: LINE.hair },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  mark: { position: 'absolute', top: -1, width: 22, height: 3 },
});
