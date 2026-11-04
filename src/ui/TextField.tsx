/**
 * Поля ввода «Штампа». title — главное поле шторки (крупно, жирная черта снизу);
 * search — поиск с иконкой; note — многострочное на «бумаге» в рамке.
 * Метка над полем — всегда видимая, не только подсказка внутри.
 */
import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';
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
    placeholderTextColor: p.pencil,
    selectionColor: p.stamp,
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
          height: 44,
          borderBottomWidth: LINE.frame,
          borderBottomColor: p.ink,
        }}
      >
        <Icon name="search" size={20} />
        <TextInput
          {...common}
          style={[TYPE.body, { flex: 1, fontSize: 16, color: p.ink, paddingVertical: 0 }]}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: variant === 'note' ? 6 : 4 }}>
      <Text style={[TYPE.label, { color: p.pencil }]}>{label}</Text>
      {variant === 'title' ? (
        <TextInput
          {...common}
          style={[
            TYPE.item,
            {
              fontSize: 22,
              lineHeight: 28,
              color: p.ink,
              paddingVertical: 6,
              borderBottomWidth: LINE.bold,
              borderBottomColor: p.ink,
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
              minHeight: 110,
              padding: 10,
              color: p.ink,
              backgroundColor: p.paper,
              borderWidth: LINE.frame,
              borderColor: p.ink,
            },
          ]}
        />
      )}
    </View>
  );
}
