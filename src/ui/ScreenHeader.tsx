/**
 * Шапка экрана: метка капсом над заголовком («3 ДОГОВОРА · 1 ЗАКРЫТ» / «ЦЕЛИ»),
 * справа — действие. С `onBack` сверху появляется стрелка «назад».
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
          {!!kicker && <Text style={[TYPE.kicker, { color: p.pencil }]}>{kicker}</Text>}
          <Text accessibilityRole="header" style={[TYPE.display, { color: p.ink }]}>
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
}

type SectionTitleProps = { title: string; count?: string | number; color?: string };

/** Заголовок раздела списка: «ДОЛГИ ……… 1». */
export function SectionTitle({ title, count, color }: SectionTitleProps) {
  const p = usePalette();
  const c = color ?? p.pencil;
  return (
    <View style={styles.section} accessibilityRole="header">
      <Text style={[TYPE.label, { fontSize: 12, color: c }]}>{title}</Text>
      {count !== undefined && <Text style={[TYPE.label, { fontSize: 12, color: c }]}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  back: { marginLeft: -10, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  titles: { flex: 1, gap: 4 },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
});
