/**
 * Поля ввода «Мульта» — наклейки с обводкой. title — главное поле шторки (крупно);
 * search — поиск со значком; note — многострочное. Метка над полем — всегда видимая.
 */
import React from 'react';
import { Platform, Text, TextInput, View, type TextInputProps } from 'react-native';
import { usePalette } from '../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../theme/metrics';
import { TYPE } from '../theme/type';
import { Icon } from './icons';

type Props = Omit<TextInputProps, 'style'> & {
  /** метка над полем; у поиска — только для чтения с экрана */
  label: string;
  variant?: 'title' | 'search' | 'note';
};

/** На вебе браузер рисует свою рамку фокуса поверх нашей обводки — убираем её. */
const NO_WEB_OUTLINE = Platform.OS === 'web' ? { outlineWidth: 0 } : null;

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
          height: 50,
          paddingHorizontal: 14,
          backgroundColor: p.surface,
          borderWidth: STROKE.outline,
          borderColor: p.line,
          borderRadius: RADIUS.md,
        }}
      >
        <Icon name="search" size={20} tone="muted" />
        <TextInput
          {...common}
          style={[TYPE.body, { flex: 1, color: p.text, paddingVertical: 0 }, NO_WEB_OUTLINE]}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: SPACE.tight }}>
      <Text style={[TYPE.meta, { color: p.muted }]}>{label}</Text>
      {variant === 'title' ? (
        <TextInput
          {...common}
          style={[
            TYPE.input,
            {
              height: 56,
              paddingHorizontal: 14,
              color: p.text,
              backgroundColor: p.bg,
              borderWidth: STROKE.outline,
              borderColor: p.line,
              borderRadius: RADIUS.md,
            },
            NO_WEB_OUTLINE,
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
              minHeight: 96,
              paddingHorizontal: 14,
              paddingVertical: SPACE.md,
              color: p.text,
              backgroundColor: p.bg,
              borderWidth: STROKE.outline,
              borderColor: p.line,
              borderRadius: RADIUS.md,
            },
            NO_WEB_OUTLINE,
          ]}
        />
      )}
    </View>
  );
}
