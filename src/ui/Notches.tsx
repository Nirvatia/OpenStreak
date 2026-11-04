/**
 * Зарубки — серия привычки, как отметки на дереве. Только в карточке привычки: в списках
 * серия — просто число. До 30 — зарубками группами по пять, дальше — одна пятёрка и число.
 */
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useT } from '../store/prefsStore';
import { usePalette } from '../store/themeStore';
import { TYPE } from '../theme/type';

export const NOTCHES_MAX = 30;

/** Путь зарубок для высоты `h`: группы по 4 вертикальные и косая. Чистая функция для тестов. */
export function notchesPath(count: number, h: number): { d: string; width: number; more: boolean } {
  const n0 = Math.max(0, Math.floor(count));
  const more = n0 > NOTCHES_MAX;
  const n = more ? 5 : n0;
  const step = Math.round(h * 0.26);
  const groupW = step * 4 + Math.round(h * 0.45);
  let d = '';
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5);
    const k = i % 5;
    const x0 = g * groupW + 2;
    if (k < 4) {
      const x = x0 + k * step + (k % 2 ? 1 : 0);
      d += `M${x + 1.5} 1 L${x - 0.5} ${h - 1} `;
    } else {
      d += `M${x0 - 2} ${Math.round(h * 0.78)} L${x0 + step * 3 + 3} ${Math.round(h * 0.22)} `;
    }
  }
  return { d: d.trim(), width: Math.max(4, (Math.ceil(n / 5) || 1) * groupW), more };
}

export function Notches({ count, height = 26 }: { count: number; height?: number }) {
  const p = usePalette();
  const t = useT();
  const { d, width, more } = notchesPath(count, height);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('a11y.notches', { count })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      {!!d && (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d={d}
            stroke={p.text}
            strokeWidth={Math.max(2.4, Math.round(height / 10))}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )}
      {more && <Text style={[TYPE.numberM, { color: p.text }]}>{count}</Text>}
    </View>
  );
}
