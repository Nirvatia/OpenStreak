/** Тонкая линия между строками. */
import React from 'react';
import { View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { LINE } from '../theme/metrics';

export function Divider({ color }: { color?: string }) {
  const p = usePalette();
  return <View style={{ height: LINE.hair, backgroundColor: color ?? p.line }} />;
}
