/**
 * Таб-бар «Мульта» (design/mult, M-Nav): наклейка над нижним краем; активная вкладка —
 * жёлтая пилюля с обводкой, остальные приглушены. Высота — `tabBarHeight` + системный отступ.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePalette } from '../store/themeStore';
import { SIZE, SPACE, STROKE } from '../theme/metrics';
import { hardShadow } from '../theme/sticker';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';
import { designStyles } from '../theme/design';

export type TabItem<K extends string> = { key: K; label: string; icon: UiIconName };

/** Сколько места таб-бар занимает над системным отступом (для тоста и прокрутки). */
export const TAB_BAR_SPACE = SPACE.tight + SIZE.tabBar + SIZE.tabBarGap;

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
      style={[
        styles.wrap,
        { backgroundColor: p.bg, paddingBottom: insets.bottom + SIZE.tabBarGap },
      ]}
    >
      <View
        accessibilityRole="tablist"
        accessibilityLabel={label}
        style={[
          styles.bar,
          { backgroundColor: p.surface, borderColor: p.line },
          hardShadow(p, 'md'),
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
              style={[
                styles.item,
                on
                  ? { backgroundColor: p.sun, borderColor: p.line }
                  : { borderColor: 'transparent' },
              ]}
            >
              <Icon name={it.icon} size={22} tone={on ? 'onSun' : 'muted'} />
              <Text
                style={[
                  TYPE.tab,
                  on && { fontFamily: TYPE.label.fontFamily },
                  { color: on ? p.onSun : p.muted },
                ]}
                numberOfLines={1}
              >
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = designStyles(() =>
  StyleSheet.create({
    wrap: { paddingTop: SPACE.tight, paddingHorizontal: 14 },
    bar: {
      height: SIZE.tabBar,
      flexDirection: 'row',
      gap: 2,
      padding: 5,
      borderWidth: STROKE.outline,
      borderRadius: 22,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderWidth: STROKE.thin,
      borderRadius: 15,
    },
  })
);
