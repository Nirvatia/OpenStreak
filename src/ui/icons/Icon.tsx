import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { usePalette } from '../../store/themeStore';
import { RADIUS, STROKE } from '../../theme/metrics';
import type { Palette } from '../../theme/palette';
import { HABIT_ICONS, UI_ICONS, type IconSpec, type UiIconName } from './paths';

/** Цвет иконки: на фоне экрана или поверх цветной подложки (`on*`). */
export type IconTone = 'text' | 'muted' | 'red' | 'teal' | 'onSun' | 'onTeal' | 'onToast';

type Props = {
  /** размер в точках; сетка иконки — 24 */
  size?: number;
  tone?: IconTone;
  /** подпись для чтения с экрана; без неё иконка декоративная */
  label?: string;
};

function Glyph({ spec, size = 24, tone = 'text', label }: Props & { spec: IconSpec }) {
  const p = usePalette();
  const color = p[tone];
  // Мелкие иконки рисуем чуть толще, чтобы линия не терялась.
  const width = size <= 20 ? 2.4 : 2.2;
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {!!spec.d && (
        <Path
          d={spec.d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {!!spec.dots && <Path d={spec.dots} fill={color} />}
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

function habitSpec(icon: string): IconSpec {
  return (HABIT_ICONS as Record<string, IconSpec>)[icon] ?? UI_ICONS.habits;
}

/** Иконка привычки или сферы по ключу из `Habit.icon`; незнакомый ключ — общая «привычки». */
export function HabitGlyph({ icon, ...rest }: Props & { icon: string }) {
  return <Glyph spec={habitSpec(icon)} {...rest} />;
}

type Tile = { bg: keyof Palette; tone: IconTone };
const TILES: Tile[] = [
  { bg: 'sun', tone: 'onSun' },
  { bg: 'sky', tone: 'onSun' },
  { bg: 'teal', tone: 'onTeal' },
  { bg: 'tag', tone: 'text' },
];

/** Цвет плитки по ключу иконки — стабильный, без хранения в данных. */
export function tileFor(icon: string): Tile {
  let h = 0;
  for (let i = 0; i < icon.length; i++) h = (h * 31 + icon.charCodeAt(i)) >>> 0;
  return TILES[h % TILES.length];
}

/** Иконка привычки на цветной плитке-наклейке (список привычек, карточка). */
export function IconTile({
  icon,
  size = 46,
  tilt = 0,
}: {
  icon: string;
  size?: number;
  /** наклон в градусах — для карточки привычки */
  tilt?: number;
}) {
  const p = usePalette();
  const tile = tileFor(icon);
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: p[tile.bg],
        borderWidth: STROKE.outline,
        borderColor: p.line,
        borderRadius: RADIUS.sm,
        transform: tilt ? [{ rotate: `${tilt}deg` }] : undefined,
      }}
    >
      <HabitGlyph icon={icon} size={Math.round(size * 0.55)} tone={tile.tone} />
    </View>
  );
}
