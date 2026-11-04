/**
 * Волк «Луны» (design/luna/L-Wolf): гранёная голова, три настроения — в деле, злой, отдых.
 * В тёмной теме у волка красные глаза (кроме злого — он и так красный).
 * `silhouette` — тёмный силуэт на полной луне («День закрыт»).
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useT } from '../../store/prefsStore';
import { usePalette, useThemeStore } from '../../store/themeStore';

export type WolfMood = 'active' | 'angry' | 'rest';

const EYES: Record<WolfMood, [string, string]> = {
  active: ['26,47 42,52 33,56', '74,47 58,52 67,56'],
  angry: ['25,44 43,53 32,55', '75,44 57,53 68,55'],
  rest: ['27,51 42,51 42,54 27,54', '73,51 58,51 58,54 73,54'],
};

type Props = {
  mood?: WolfMood;
  size?: number;
  /** цвет подложки: им «вырезаны» нос и глаза; по умолчанию фон экрана */
  on?: string;
  silhouette?: boolean;
};

export function Wolf({ mood = 'active', size = 64, on, silhouette = false }: Props) {
  const p = usePalette();
  const dark = useThemeStore((s) => s.scheme === 'dark');
  const t = useT();
  const tones: Record<WolfMood, [string, string]> = {
    active: [p.text, p.textShade],
    angry: [p.blood, p.bloodShade],
    rest: [p.muted, p.mutedShade],
  };
  const [a, b] = silhouette ? [p.silhouette, p.silhouetteShade] : tones[mood];
  const cut = silhouette ? p.silhouetteFeature : (on ?? p.bg);
  const eye = dark && mood !== 'angry' ? p.blood : cut;
  const [eyeL, eyeR] = EYES[mood];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={t(`wolf.${mood}`)}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Polygon points="16,8 38,28 18,36" fill={a} />
        <Polygon points="84,8 62,28 82,36" fill={b} />
        <Polygon points="18,36 38,27 50,25 50,96 40,90 27,74 12,68 18,62 8,54" fill={a} />
        <Polygon points="82,36 62,27 50,25 50,96 60,90 73,74 88,68 82,62 92,54" fill={b} />
        <Polygon points="50,36 50,76 42,72 44,52" fill={b} />
        <Polygon points="50,36 50,76 58,72 56,52" fill={a} />
        <Polygon points="42,74 58,74 50,86" fill={cut} />
        <Polygon points={eyeL} fill={eye} />
        <Polygon points={eyeR} fill={eye} />
      </Svg>
    </View>
  );
}
