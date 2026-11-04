import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { usePalette } from '../../store/themeStore';
import { HABIT_ICONS, UI_ICONS, type UiIconName } from './paths';

type Props = {
  /** размер в точках; сетка иконки — 24 */
  size?: number;
  /** по умолчанию — цвет чернил текста (`ink`) */
  color?: string;
  /** подпись для чтения с экрана; без неё иконка декоративная */
  label?: string;
};

function Glyph({ d, size = 24, color, label }: Props & { d: string }) {
  const palette = usePalette();
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={color ?? palette.ink}
        strokeWidth={2.5}
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
    </Svg>
  );
  if (!label) return svg;
  // Подпись — на обёртке: View одинаково понимают и iOS/Android, и веб.
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      {svg}
    </View>
  );
}

export function Icon({ name, ...rest }: Props & { name: UiIconName }) {
  return <Glyph d={UI_ICONS[name]} {...rest} />;
}

/** Иконка привычки по ключу из `Habit.icon`; незнакомый ключ — общая иконка «серия». */
export function HabitGlyph({ icon, ...rest }: Props & { icon: string }) {
  const d = (HABIT_ICONS as Record<string, string>)[icon] ?? UI_ICONS.streak;
  return <Glyph d={d} {...rest} />;
}
