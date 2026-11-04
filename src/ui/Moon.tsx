import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { usePalette } from '../store/themeStore';
import { litPath } from './moon';

type Props = {
  /** 0 — новолуние, 1 — полнолуние */
  phase: number;
  size?: number;
  /** освещённая часть: жёлтая луна или красная (слив) */
  tone?: 'sun' | 'red';
  /** кольцо: обычное, красное (слив, долг) или приглушённое (выходной) */
  ring?: 'ring' | 'red' | 'muted';
  /** пунктирное кольцо без заливки — выходной */
  dashed?: boolean;
};

/** Толщина кольца в единицах viewBox (100): у маленьких лун кольцо толще, чтобы было видно. */
function ringWidth(size: number) {
  if (size <= 36) return 8;
  if (size <= 60) return 6;
  return 5;
}

/**
 * Луна «Мульта» (design/mult, M-Moon): тёмная сторона, жёлтая освещённая часть и кольцо;
 * у полной луны — кратеры. Декоративная: смысл передаёт подпись родителя (кнопка, строка).
 */
export function Moon({ phase, size = 28, tone = 'sun', ring = 'ring', dashed = false }: Props) {
  const p = usePalette();
  const d = dashed ? null : litPath(phase);
  const full = !dashed && phase >= 0.999;
  const crater = tone === 'red' ? p.craterRed : p.crater;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {!dashed && <Circle cx={50} cy={50} r={46} fill={p.track} />}
      {d && <Path d={d} fill={p[tone]} />}
      {full && (
        <>
          <Circle cx={36} cy={38} r={8} fill={crater} />
          <Circle cx={62} cy={62} r={11} fill={crater} />
          <Circle cx={66} cy={32} r={5} fill={crater} />
        </>
      )}
      <Circle
        cx={50}
        cy={50}
        r={46}
        fill="none"
        stroke={p[ring]}
        strokeWidth={ringWidth(size)}
        strokeDasharray={dashed ? '12 10' : undefined}
        strokeLinecap="round"
      />
    </Svg>
  );
}
