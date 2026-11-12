/**
 * Строка формы в «Обычном» оформлении: значок, название, текущее значение (акцентом, если
 * задано), шеврон. По нажатию раскрывается внутри себя — варианты показываются под строкой,
 * а не рядом с ней, поэтому на экране нет россыпи кнопок. Разделитель — тонкая линия.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { SPACE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon, type UiIconName } from './icons';

type Props = {
  /** значок слева; без него строка начинается с названия (настройки) */
  icon?: UiIconName;
  label: string;
  value: string;
  /** значение задано (не по умолчанию): рисуется акцентом */
  set?: boolean;
  open: boolean;
  onPress: () => void;
  /** раскрытое содержимое: чипы вариантов, поле ввода */
  children?: React.ReactNode;
};

export function FormRow({ icon, label, value, set = false, open, onPress, children }: Props) {
  const p = usePalette();
  return (
    <View style={[styles.wrap, { borderBottomColor: p.divider }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}: ${value}`}
        onPress={onPress}
        style={styles.row}
      >
        {icon && <Icon name={icon} size={22} tone="muted" />}
        <Text style={[TYPE.item, styles.label, { color: p.text }]}>{label}</Text>
        <Text numberOfLines={1} style={[TYPE.row, styles.value, { color: set ? p.sun : p.muted }]}>
          {value}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevron" size={16} tone="muted" />
        </View>
      </Pressable>
      {open && !!children && (
        <View style={[styles.body, !icon && { paddingLeft: 0 }]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 54 },
  label: { flex: 1 },
  value: { maxWidth: '55%' },
  body: { paddingLeft: 36, paddingBottom: SPACE.md, gap: SPACE.sm },
});
