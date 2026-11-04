/**
 * Волк-печать — маскот «Штампа» (`design/stamp/B-Kit.dc.html`) в трёх состояниях:
 * в деле (серия идёт), злой (срыв, долг), отдых (выходной).
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { LINE } from '../../theme/stamp';

export type WolfMood = 'active' | 'angry' | 'rest';

const EYES: Record<WolfMood, [string, string]> = {
  active: ['29,47 45,51 39,56', '71,47 55,51 61,56'],
  angry: ['28,44 46,52 38,55', '72,44 54,52 62,55'],
  rest: ['29,51 45,51 45,54 29,54', '71,51 55,51 55,54 71,54'],
};

const TILT: Record<WolfMood, number> = { active: -8, angry: 5, rest: -3 };

type Props = {
  mood: WolfMood;
  /** диаметр печати */
  size?: number;
  /** без круглой рамки — только голова */
  bare?: boolean;
  /** цвет подложки: им «вырезаны» морда и глаза; по умолчанию фон экрана */
  on?: string;
};

export function WolfSeal({ mood, size = 96, bare = false, on }: Props) {
  const p = usePalette();
  const t = useT();
  const color = mood === 'angry' ? p.stamp : mood === 'rest' ? p.rest : p.ink;
  const cut = on ?? p.bg;
  const [eyeL, eyeR] = EYES[mood];
  const head = bare ? size : Math.round(size * 0.7);

  const svg = (
    <Svg width={head} height={head} viewBox="0 0 100 100">
      <Polygon points="16,6 36,32 12,42" fill={color} />
      <Polygon points="84,6 64,32 88,42" fill={color} />
      <Polygon
        points="12,42 32,30 50,26 68,30 88,42 92,58 72,74 60,92 50,97 40,92 28,74 8,58"
        fill={color}
      />
      <Polygon points="40,58 50,52 60,58 58,84 50,90 42,84" fill={cut} />
      <Polygon points="44,80 56,80 50,87" fill={color} />
      <Polygon points={eyeL} fill={cut} />
      <Polygon points={eyeR} fill={cut} />
    </Svg>
  );

  const a11y = {
    accessible: true,
    accessibilityRole: 'image' as const,
    accessibilityLabel: t(`wolf.${mood}`),
  };
  if (bare) return <View {...a11y}>{svg}</View>;
  return (
    <View
      {...a11y}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: LINE.bold,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: `${TILT[mood]}deg` }],
      }}
    >
      {svg}
    </View>
  );
}
