import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import { usePalette } from '../../store/themeStore';
import { HABIT_ICONS, UI_ICONS, type IconSpec, type UiIconName } from './paths';

/** Тон иконки: основной цвет и его тень для правой грани. */
export type IconTone = 'text' | 'muted' | 'blood' | 'onText';

type Props = {
  /** размер в точках; сетка иконки — 24 */
  size?: number;
  tone?: IconTone;
  /** подпись для чтения с экрана; без неё иконка декоративная */
  label?: string;
};

function useTone(tone: IconTone): [string, string] {
  const p = usePalette();
  switch (tone) {
    case 'muted':
      return [p.muted, p.mutedShade];
    case 'blood':
      return [p.blood, p.bloodShade];
    case 'onText':
      return [p.onText, p.onText];
    default:
      return [p.text, p.textShade];
  }
}

function Glyph({ spec, size = 24, tone = 'text', label }: Props & { spec: IconSpec }) {
  const [main, shade] = useTone(tone);
  const clip = `facet-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const rule = spec.holes ? 'evenodd' : 'nonzero';
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id={clip}>
          <Rect x={0} y={0} width={12} height={24} />
        </ClipPath>
      </Defs>
      {/* Правая грань — тенью, левая — основным цветом поверх, по той же форме. */}
      <Path d={spec.d} fill={shade} fillRule={rule} />
      <Path d={spec.d} fill={main} fillRule={rule} clipPath={`url(#${clip})`} />
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
  return <Glyph spec={UI_ICONS[name]} {...rest} />;
}

/** Иконка привычки или сферы по ключу из `Habit.icon`; незнакомый ключ — общая «привычки». */
export function HabitGlyph({ icon, ...rest }: Props & { icon: string }) {
  const spec = (HABIT_ICONS as Record<string, IconSpec>)[icon] ?? UI_ICONS.habits;
  return <Glyph spec={spec} {...rest} />;
}
