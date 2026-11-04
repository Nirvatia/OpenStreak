/**
 * Волк «Мульта» (design/mult, M-Wolf): свой персонаж в духе мультфильмов 70-х — стально-синий,
 * с зазубриной на левом ухе. Три настроения: в деле (ухмылка), красава (доволен), слил.
 * Без героев и примет чужих мультфильмов.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';

export type WolfMood = 'smirk' | 'proud' | 'meh';

const LABEL = { smirk: 'wolf.smirk', proud: 'wolf.proud', meh: 'wolf.meh' } as const;

type Props = { mood?: WolfMood; size?: number };

export function Wolf({ mood = 'smirk', size = 76 }: Props) {
  const p = usePalette();
  const t = useT();
  const ink = p.line;
  const stroke = { stroke: ink, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t(LABEL[mood])}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <G {...stroke} strokeWidth={3}>
          <Path d="M22 62 L6 70 L20 74 L10 82 L28 80 Z" fill={p.fur} />
          <Path d="M98 62 L114 70 L100 74 L110 82 L92 80 Z" fill={p.fur} />
          <Path d="M24 46 L28 6 L54 30 Z" fill={p.fur} />
          <Path d="M96 46 L92 6 L66 30 Z" fill={p.fur} />
          <Path d="M31 36 L32 18 L45 31 Z" fill={p.ear} strokeWidth={2} />
          <Path d="M89 36 L88 18 L75 31 Z" fill={p.ear} strokeWidth={2} />
          <Path
            d="M18 54 C18 32 38 22 60 22 C82 22 102 32 102 54 C102 70 96 80 86 88 L60 108 L34 88 C24 80 18 70 18 54 Z"
            fill={p.fur}
          />
          <Path
            d="M42 70 C42 60 50 56 60 56 C70 56 78 60 78 70 C78 84 70 96 60 100 C50 96 42 84 42 70 Z"
            fill={p.muzzle}
          />
        </G>
        <Path d="M60 22 L54 32 L60 30 L66 34 Z" fill={p.furShade} />
        <Path d="M27 12 L31 16 L26 17" fill="none" {...stroke} strokeWidth={2.5} />
        <Ellipse cx={60} cy={67} rx={8} ry={5.5} fill={ink} />
        <Ellipse cx={57} cy={65.5} rx={2.4} ry={1.4} fill={p.fur} />

        {mood === 'smirk' && (
          <G {...stroke}>
            <Path d="M33 50 Q42 42 51 50 Q42 55 33 50 Z" fill={p.eye} strokeWidth={2.5} />
            <Path d="M69 50 Q78 42 87 50 Q78 55 69 50 Z" fill={p.eye} strokeWidth={2.5} />
            <Circle cx={44} cy={49.5} r={3.4} fill={ink} stroke="none" />
            <Circle cx={80} cy={49.5} r={3.4} fill={ink} stroke="none" />
            <Path d="M32 47 L52 45.5" strokeWidth={3} />
            <Path d="M68 45.5 L88 47" strokeWidth={3} />
            <Path d="M31 39 L51 43" strokeWidth={3.5} />
            <Path d="M69 43 L89 37" strokeWidth={3.5} />
            <Path d="M50 80 Q58 86 71 77" fill="none" strokeWidth={3} />
            <Path d="M65 81 L66.5 86 L68.5 80" fill={p.eye} strokeWidth={1.5} />
          </G>
        )}

        {mood === 'proud' && (
          <G {...stroke}>
            <Path d="M34 51 Q42 43 50 51" fill="none" strokeWidth={3.5} />
            <Path d="M70 51 Q78 43 86 51" fill="none" strokeWidth={3.5} />
            <Path d="M32 38 L50 40" strokeWidth={3.5} />
            <Path d="M70 40 L88 38" strokeWidth={3.5} />
            <Path d="M47 77 Q60 96 73 77 Z" fill={ink} strokeWidth={2.5} />
            <Path d="M53 85 Q60 92 67 85 Q60 82 53 85 Z" fill={p.tongue} stroke="none" />
            <Path d="M50 77.5 L52 82 L54.5 77.5 Z" fill={p.eye} stroke="none" />
            <Path d="M65.5 77.5 L68 82 L70 77.5 Z" fill={p.eye} stroke="none" />
          </G>
        )}

        {mood === 'meh' && (
          <G {...stroke}>
            <Circle cx={42} cy={50} r={7} fill={p.eye} strokeWidth={2.5} />
            <Circle cx={78} cy={50} r={7} fill={p.eye} strokeWidth={2.5} />
            <Circle cx={42} cy={52} r={3} fill={ink} stroke="none" />
            <Circle cx={78} cy={52} r={3} fill={ink} stroke="none" />
            <Path d="M32 36 L50 41" strokeWidth={3.5} />
            <Path d="M70 42 L88 42" strokeWidth={3.5} />
            <Path d="M51 83 Q55.5 79 60 83 Q64.5 87 69 83" fill="none" strokeWidth={3} />
            <Path d="M86 30 Q90 36 86 40 Q82 36 86 30 Z" fill={p.drop} strokeWidth={2} />
          </G>
        )}
      </Svg>
    </View>
  );
}
