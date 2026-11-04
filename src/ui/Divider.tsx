/** Пунктир между строками в наклейке. */
import React from 'react';
import { View } from 'react-native';
import { usePalette } from '../store/themeStore';
import { STROKE } from '../theme/metrics';

export function Divider() {
  const p = usePalette();
  return (
    <View
      style={{ borderBottomWidth: STROKE.thin, borderStyle: 'dashed', borderColor: p.divider }}
    />
  );
}
