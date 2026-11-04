import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { usePalette } from '../store/themeStore';
import { litPath } from './moon';

type Props = {
  /** 0 — новолуние, 1 — полнолуние */
  phase: number;
  size?: number;
  /** цвет освещённой части: лунный свет или кровь (слив) */
  tone?: 'text' | 'blood';
  /** кольцо: приглушённое, яркое (сегодня / в процессе) или красное */
  ring?: 'muted' | 'text' | 'blood';
  /** пунктирное кольцо — выходной */
  dashed?: boolean;
};

/** Толщина кольца в единицах viewBox (100): у маленьких лун кольцо толще, чтобы было видно. */
function ringWidth(size: number) {
  if (size <= 28) return 7;
  if (size <= 60) return 4;
  return 2.5;
}

/** Луна-фаза. Декоративная: смысл передаёт подпись родителя (кнопка, строка). */
export function Moon({ phase, size = 24, tone = 'text', ring = 'muted', dashed = false }: Props) {
  const p = usePalette();
  const d = litPath(phase);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle
        cx={50}
        cy={50}
        r={46}
        fill={p.raised}
        stroke={p[ring]}
        strokeWidth={ringWidth(size)}
        strokeDasharray={dashed ? '10 8' : undefined}
      />
      {d && <Path d={d} fill={p[tone]} />}
    </Svg>
  );
}
