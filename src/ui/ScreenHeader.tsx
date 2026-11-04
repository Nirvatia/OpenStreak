/**
 * Шапка экрана: мелкая подпись над заголовком («3 договора · 1 закрыт» / «Цели»),
 * справа — действие. С `onBack` сверху — стрелка «назад».
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';
import { IconButton } from './Button';

type Props = {
  title: string;
  kicker?: string;
  right?: React.ReactNode;
  onBack?: () => void;
};

export function ScreenHeader({ title, kicker, right, onBack }: Props) {
  const p = usePalette();
  const t = useT();
  return (
    <View style={styles.wrap}>
      {onBack && (
        <View style={styles.back}>
          <IconButton icon="back" label={t('common.back')} onPress={onBack} />
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.titles}>
          {!!kicker && <Text style={[TYPE.meta, { color: p.muted }]}>{kicker}</Text>}
          <Text accessibilityRole="header" style={[TYPE.title, { color: p.text }]}>
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
}

type SectionTitleProps = { title: string; count?: string | number; color?: string };

/** Подпись раздела списка: «Осталось ……… 4», «Долги ……… 1» (красным). */
export function SectionTitle({ title, count, color }: SectionTitleProps) {
  const p = usePalette();
  const c = color ?? p.muted;
  return (
    <View style={styles.section} accessibilityRole="header">
      <Text style={[TYPE.label, { color: c }]}>{title}</Text>
      {count !== undefined && <Text style={[TYPE.label, { color: c }]}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  back: { marginLeft: -10, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  titles: { flex: 1, gap: 2 },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
});
