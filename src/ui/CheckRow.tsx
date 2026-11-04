/**
 * Строка дела или привычки: чекбокс, название (выполнено — карандашом и зачёркнуто),
 * подпись, что-то справа, пунктир снизу. Печать (`stamp`) накладывается поверх справа.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';
import { CheckBox } from './CheckBox';
import { Divider } from './Divider';

type Props = {
  title: string;
  meta?: string;
  checked: boolean;
  onToggle?: (checked: boolean) => void;
  /** нажатие на строку (открыть) */
  onPress?: () => void;
  /** под названием: полоска прогресса и т. п. */
  below?: React.ReactNode;
  /** справа: важность, счёт, иконка */
  right?: React.ReactNode;
  /** печать поверх правого края */
  stamp?: React.ReactNode;
  /** свой текст чекбокса для чтения с экрана */
  checkLabel?: string;
};

export function CheckRow(props: Props) {
  const p = usePalette();
  const { title, meta, checked } = props;
  return (
    <View>
      <View style={styles.row}>
        <CheckBox
          checked={checked}
          onChange={props.onToggle}
          title={title}
          label={props.checkLabel}
        />
        <Pressable
          style={styles.body}
          onPress={props.onPress}
          disabled={!props.onPress}
          accessibilityRole={props.onPress ? 'button' : undefined}
        >
          <Text
            style={[
              TYPE.item,
              {
                color: checked ? p.pencil : p.ink,
                textDecorationLine: checked ? 'line-through' : 'none',
              },
            ]}
          >
            {title}
          </Text>
          {!!meta && <Text style={[TYPE.meta, { color: p.pencil }]}>{meta}</Text>}
          {props.below}
        </Pressable>
        {props.right}
        {props.stamp && (
          <View style={styles.stamp} pointerEvents="none">
            {props.stamp}
          </View>
        )}
      </View>
      <Divider dashed />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  body: { flex: 1, minWidth: 0, gap: 2 },
  stamp: { position: 'absolute', right: 6, top: 7 },
});
