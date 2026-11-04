import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';

type Props = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** что отмечаем — для чтения с экрана: «Отметить: …» / «Снять отметку: …» */
  title: string;
  /** свой текст для чтения с экрана (например, «Добавить подходы: …») */
  label?: string;
  disabled?: boolean;
};

const BOX = 28;

/** Квадрат 28 с рамкой 2.5; отмечен — залит чернилами с галочкой. Зона нажатия — 44. */
export function CheckBox({ checked, onChange, title, label, disabled }: Props) {
  const p = usePalette();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label ?? t(checked ? 'a11y.uncheck' : 'a11y.check', { title })}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      hitSlop={8}
    >
      <View
        style={{
          width: BOX,
          height: BOX,
          borderWidth: LINE.frame,
          borderColor: p.ink,
          backgroundColor: checked ? p.ink : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M4 12 L10 18 L20 6"
              stroke={p.onInk}
              strokeWidth={3.5}
              strokeLinecap="square"
              fill="none"
            />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}
