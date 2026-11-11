/**
 * Наклейка — главный приём «Мульта»: обводка и жёсткая тень без размытия.
 * `boxShadow` работает на iOS, Android (новая архитектура) и в вебе.
 */
import type { ViewStyle } from 'react-native';
import { STROKE, SHADOW } from './metrics';
import type { Palette } from './palette';

export type ShadowSize = keyof typeof SHADOW | 'none';

export function hardShadow(p: Palette, size: ShadowSize = 'lg'): ViewStyle {
  if (size === 'none') return {};
  const o = SHADOW[size];
  if (o === 0) return {};
  return { boxShadow: `${o}px ${o}px 0px 0px ${p.shadow}` };
}

/** Обводка и (по желанию) тень наклейки. */
export function sticker(
  p: Palette,
  shadow: ShadowSize = 'lg',
  width: number = STROKE.outline
): ViewStyle {
  return { borderWidth: width, borderColor: p.line, ...hardShadow(p, shadow) };
}

/** Наклон украшения: плашки, бейджа. */
export function tilt(deg: number): ViewStyle {
  return deg ? { transform: [{ rotate: `${deg}deg` }] } : {};
}
