/**
 * Шапка экрана: мелкая подпись над заголовком («7 в работе · 1 долг» / «Дела»), справа —
 * действие. С `onBack` — круглая кнопка «назад» слева от заголовка.
 * `SectionTitle` — заголовок раздела плашкой под углом: «Осталось · 4».
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { IconButton } from './Button';
import { Tag, type Tone } from './Sticker';

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
    <View style={styles.row}>
      {onBack && <IconButton icon="back" label={t('common.back')} onPress={onBack} />}
      <View style={styles.titles}>
        {!!kicker && <Text style={[TYPE.meta, { color: p.muted }]}>{kicker}</Text>}
        <Text accessibilityRole="header" style={[TYPE.title, { color: p.text }]}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

type SectionTitleProps = {
  title: string;
  count?: string | number;
  tone?: Tone;
  /** наклон в градусах */
  tilt?: number;
};

/** Заголовок раздела — плашка: «Осталось · 4» (жёлтая), «Сделано · 3» (бирюза), «Долги · 1». */
export function SectionTitle({ title, count, tone = 'tag', tilt = -2 }: SectionTitleProps) {
  return <Tag label={title} count={count} tone={tone} tilt={tilt} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.md },
  titles: { flex: 1, gap: SPACE.xs },
});
