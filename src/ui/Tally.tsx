/**
 * Счёт палочками: группы по пять (четыре палочки и косая). До 30 — палочками,
 * дальше — одна зачёркнутая пятёрка и число.
 */
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Line } from 'react-native-svg';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';

export const TALLY_MAX = 30;

const H = 44;
const GROUP_W = 34;
const GROUP_GAP = 12;
/** Палочки чуть «гуляют», как от руки (из макета). */
const STICKS: [number, number, number, number][] = [
  [5, 5, 4, 39],
  [13, 4, 13, 40],
  [21, 5, 22, 39],
  [29, 4, 29, 40],
];
const SLASHES: [number, number, number, number][] = [
  [0, 32, 34, 11],
  [0, 33, 34, 10],
];

/** Сколько групп и палочек в последней — для рисования и тестов. */
export function tallyLayout(count: number): { groups: number; rest: number; overflow: boolean } {
  const n = Math.max(0, Math.floor(count));
  if (n > TALLY_MAX) return { groups: 1, rest: 0, overflow: true };
  return { groups: Math.floor(n / 5), rest: n % 5, overflow: false };
}

type Props = { count: number; color?: string; height?: number };

export function Tally({ count, color, height = H }: Props) {
  const p = usePalette();
  const t = useT();
  const c = color ?? p.ink;
  const { groups, rest, overflow } = tallyLayout(count);
  const blocks = groups + (rest > 0 ? 1 : 0);
  const width = Math.max(1, blocks * (GROUP_W + GROUP_GAP) - GROUP_GAP);
  const scale = height / H;

  const lines: React.ReactNode[] = [];
  for (let g = 0; g < blocks; g++) {
    const x0 = g * (GROUP_W + GROUP_GAP);
    const sticks = g < groups ? 4 : rest;
    for (let i = 0; i < sticks; i++) {
      const [x1, y1, x2, y2] = STICKS[i];
      lines.push(<Line key={`${g}-${i}`} x1={x0 + x1} y1={y1} x2={x0 + x2} y2={y2} />);
    }
    if (g < groups) {
      const [x1, y1, x2, y2] = SLASHES[g % 2];
      lines.push(<Line key={`${g}-s`} x1={x0 + x1} y1={y1} x2={x0 + x2} y2={y2} />);
    }
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('a11y.tally', { count })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      {blocks > 0 && (
        <Svg width={width * scale} height={height} viewBox={`0 0 ${width} ${H}`}>
          <G stroke={c} strokeWidth={3.5} strokeLinecap="round">
            {lines}
          </G>
        </Svg>
      )}
      {overflow && <Text style={[TYPE.numberM, { color: c, fontSize: 26 * scale }]}>{count}</Text>}
    </View>
  );
}
