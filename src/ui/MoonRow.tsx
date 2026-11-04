/**
 * Строка дела или привычки: луна-отметка слева (пустая / неполная / полная), название,
 * подпись, справа — пометка. Выполненное — приглушено и зачёркнуто.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { LINE, SIZE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Moon } from './Moon';

type Props = {
  title: string;
  sub?: string;
  /** 0…1: 0 — не сделано, 1 — сделано, между — числовая привычка в процессе */
  phase: number;
  /** красное кольцо — долг, просрочено */
  debt?: boolean;
  /** выполнено: название приглушено и зачёркнуто */
  done?: boolean;
  /** нажатие на луну */
  onToggle?: () => void;
  /** свой текст луны для чтения с экрана (например, «Добавить подходы: …») */
  toggleLabel?: string;
  /** нажатие на строку (открыть) */
  onPress?: () => void;
  /** справа: время, «долг», важность */
  right?: React.ReactNode;
};

export function MoonRow(props: Props) {
  const p = usePalette();
  const t = useT();
  const { title, done = false } = props;
  return (
    <View style={[styles.row, { borderBottomColor: p.line }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={props.toggleLabel ?? t(done ? 'a11y.uncheck' : 'a11y.check', { title })}
        onPress={props.onToggle}
        style={({ pressed }) => [styles.moon, pressed && { backgroundColor: p.surface }]}
      >
        <Moon phase={props.phase} size={24} ring={props.debt && !done ? 'blood' : 'muted'} />
      </Pressable>
      <Pressable
        style={styles.body}
        onPress={props.onPress}
        disabled={!props.onPress}
        accessibilityRole={props.onPress ? 'button' : undefined}
      >
        <Text
          style={[
            TYPE.item,
            { color: done ? p.muted : p.text, textDecorationLine: done ? 'line-through' : 'none' },
          ]}
        >
          {title}
        </Text>
        {!!props.sub && <Text style={[TYPE.meta, { color: p.muted }]}>{props.sub}</Text>}
      </Pressable>
      {props.right}
    </View>
  );
}

type LogProps = {
  time: string;
  title: string;
  /** пометка справа: «зачёт», «слив», «держусь» */
  mark?: string;
  /** пометка красным — слив */
  bad?: boolean;
};

/** Строка журнала «Сделано»: время, что сделано, пометка. */
export function LogRow({ time, title, mark, bad }: LogProps) {
  const p = usePalette();
  return (
    <View style={styles.log}>
      <Text style={[TYPE.meta, styles.time, { color: p.muted }]}>{time}</Text>
      <Text style={[TYPE.body, styles.logTitle, { color: p.muted }]} numberOfLines={1}>
        {title}
      </Text>
      {!!mark && <Text style={[TYPE.mark, { color: bad ? p.blood : p.text }]}>{mark}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: SIZE.row,
    borderBottomWidth: LINE.hair,
  },
  moon: {
    width: SIZE.touch,
    height: SIZE.touch,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  log: { flexDirection: 'row', alignItems: 'baseline', gap: 8, minHeight: 30 },
  time: { width: 46 },
  logTitle: { flex: 1, textDecorationLine: 'line-through' },
});
