/**
 * Печать — главный приём «Штампа»: слово в рамке, повёрнутое «от руки».
 * Вид печати задаёт смысл: зачёт, долг (пунктир), срыв, выходной (синий), закрыто, держись.
 */
import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import type { Palette } from '../theme/palette';
import { LINE, stampTilt } from '../theme/stamp';
import { TYPE } from '../theme/type';

export type StampKind = 'done' | 'debt' | 'slip' | 'rest' | 'closed' | 'clean';
export type StampSize = 'sm' | 'md' | 'lg';

const KIND: Record<StampKind, { color: keyof Palette; dashed: boolean }> = {
  done: { color: 'stamp', dashed: false },
  debt: { color: 'stamp', dashed: true },
  slip: { color: 'stamp', dashed: false },
  rest: { color: 'rest', dashed: false },
  closed: { color: 'stamp', dashed: false },
  clean: { color: 'ink', dashed: false },
};

const SIZE: Record<StampSize, { font: number; border: number; padX: number }> = {
  sm: { font: 14, border: LINE.row, padX: 6 },
  md: { font: 15, border: LINE.bold, padX: 8 },
  lg: { font: 20, border: LINE.bold, padX: 10 },
};

type Props = {
  kind: StampKind;
  size?: StampSize;
  /** ключ для стабильного наклона (обычно id записи) или явный угол в градусах */
  tilt?: string | number;
  /** свой текст вместо стандартного для вида */
  text?: string;
  style?: StyleProp<ViewStyle>;
};

export function Stamp({ kind, size = 'md', tilt = kind, text, style }: Props) {
  const p = usePalette();
  const t = useT();
  const k = KIND[kind];
  const s = SIZE[size];
  const color = p[k.color];
  const angle = typeof tilt === 'number' ? tilt : stampTilt(tilt);
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          borderWidth: s.border,
          borderStyle: k.dashed ? 'dashed' : 'solid',
          borderColor: color,
          paddingHorizontal: s.padX,
          transform: [{ rotate: `${angle}deg` }],
        },
        style,
      ]}
    >
      <Text
        style={[
          TYPE.stamp,
          { color, fontSize: s.font, lineHeight: Math.round(s.font * 1.25) },
          { letterSpacing: Math.round(s.font * 0.12 * 10) / 10 },
        ]}
      >
        {text ?? t(`stamp.${kind}`)}
      </Text>
    </View>
  );
}
