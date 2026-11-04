/**
 * Линия между строками. Пунктир рисуется SVG: `borderStyle: 'dashed'` на одной стороне
 * iOS не поддерживает.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/stamp';

type Props = {
  dashed?: boolean;
  /** толщина; по умолчанию 1 для пунктира и 2 для сплошной */
  weight?: number;
  color?: string;
};

export function Divider({ dashed = false, weight, color }: Props) {
  const p = usePalette();
  const w = weight ?? (dashed ? LINE.hair : LINE.row);
  const c = color ?? p.ink;
  if (!dashed) return <View style={{ height: w, backgroundColor: c }} />;
  return (
    <Svg width="100%" height={w}>
      <Line
        x1="0"
        y1={w / 2}
        x2="100%"
        y2={w / 2}
        stroke={c}
        strokeWidth={w}
        strokeDasharray="4 3"
      />
    </Svg>
  );
}
