/**
 * Поля ввода. title — главное поле шторки (крупно, черта снизу); search — поиск на подложке;
 * note — многострочное на подложке. Метка над полем — всегда видимая.
 */
import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon } from './icons';

type Props = Omit<TextInputProps, 'style'> & {
  /** метка над полем; у поиска — только для чтения с экрана */
  label: string;
  variant?: 'title' | 'search' | 'note';
};

export function TextField({ label, variant = 'title', ...input }: Props) {
  const p = usePalette();
  const common = {
    placeholderTextColor: p.muted,
    selectionColor: p.text,
    accessibilityLabel: label,
    ...input,
  };

  if (variant === 'search') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 44,
          paddingHorizontal: 12,
          backgroundColor: p.surface,
        }}
      >
        <Icon name="search" size={18} tone="muted" />
        <TextInput
          {...common}
          style={[TYPE.body, { flex: 1, color: p.text, paddingVertical: 0 }]}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={[TYPE.meta, { color: p.muted }]}>{label}</Text>
      {variant === 'title' ? (
        <TextInput
          {...common}
          style={[
            TYPE.heading,
            {
              color: p.text,
              paddingVertical: 6,
              borderBottomWidth: LINE.bold,
              borderBottomColor: p.text,
            },
          ]}
        />
      ) : (
        <TextInput
          multiline
          textAlignVertical="top"
          {...common}
          style={[
            TYPE.body,
            {
              minHeight: 104,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: p.text,
              backgroundColor: p.surface,
              borderWidth: LINE.hair,
              borderColor: p.line,
            },
          ]}
        />
      )}
    </View>
  );
}
