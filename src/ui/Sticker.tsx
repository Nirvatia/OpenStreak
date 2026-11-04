/**
 * Базовые приёмы «Мульта» (design/mult): наклейка, плашка под углом, пометка-пилюля,
 * круглый бейдж серии и пузырь цитаты от волка.
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette } from '../store/themeStore';
import { RADIUS, SPACE, STROKE } from '../theme/metrics';
import type { Palette } from '../theme/palette';
import { hardShadow, tilt as tiltStyle, type ShadowSize } from '../theme/sticker';
import { TYPE } from '../theme/type';
import { Wolf, type WolfMood } from './icons';

/** Подложка с подходящим к ней цветом текста — пары проверены в palettes.json. */
export type Tone = 'surface' | 'tag' | 'sun' | 'teal' | 'red';
const ON: Record<Tone, keyof Palette> = {
  surface: 'text',
  tag: 'text',
  sun: 'onSun',
  teal: 'onTeal',
  red: 'onRed',
};

export function onTone(p: Palette, tone: Tone): string {
  return p[ON[tone]];
}

type CardProps = {
  children: React.ReactNode;
  tone?: Tone;
  shadow?: ShadowSize;
  radius?: number;
  /** внутренние поля: стандартные или без них (для списка строк — свои поля у строк) */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Наклейка: обводка и жёсткая тень. Списки, луна дня, договор. */
export function Card({
  children,
  tone = 'surface',
  shadow = 'lg',
  radius = RADIUS.lg,
  padded = true,
  style,
}: CardProps) {
  const p = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: p[tone],
          borderWidth: STROKE.outline,
          borderColor: p.line,
          borderRadius: radius,
        },
        hardShadow(p, shadow),
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const TAG_FONT = { label: TYPE.label, date: TYPE.dateLine, badge: TYPE.badge } as const;

type TagProps = {
  label: string;
  /** число после точки: «Осталось · 4» */
  count?: string | number;
  tone?: Tone;
  /** наклон в градусах */
  tilt?: number;
  /** заголовок раздела для чтения с экрана */
  header?: boolean;
  /** шрифт: подпись раздела, дата (Unbounded) или бейдж с числом (Unbounded, мельче) */
  font?: 'label' | 'date' | 'badge';
  /** тень наклейки */
  shadow?: ShadowSize;
  /** красная обводка — заметка о сливе */
  alert?: boolean;
};

/** Плашка под углом: заголовки разделов, дата, «Договор № 007». */
export function Tag({
  label,
  count,
  tone = 'tag',
  tilt = 0,
  header = true,
  font = 'label',
  shadow = 'none',
  alert = false,
}: TagProps) {
  const p = usePalette();
  return (
    <View
      accessibilityRole={header ? 'header' : undefined}
      style={[
        styles.tag,
        { backgroundColor: p[tone], borderColor: alert ? p.red : p.line },
        hardShadow(p, shadow),
        tiltStyle(tilt),
      ]}
    >
      <Text style={[TAG_FONT[font], { color: onTone(p, tone) }]}>
        {count !== undefined ? `${label} · ${count}` : label}
      </Text>
    </View>
  );
}

/** Пометка-пилюля: «зачёт», «слив», «держусь», «долг». Залитая — для «долг». */
export function Pill({
  label,
  tone = 'teal',
  filled = false,
}: {
  label: string;
  tone?: 'teal' | 'red' | 'muted';
  filled?: boolean;
}) {
  const p = usePalette();
  const color = p[tone];
  const fg = filled ? (tone === 'red' ? p.onRed : tone === 'teal' ? p.onTeal : p.surface) : color;
  return (
    <View
      style={[
        styles.pill,
        filled ? { backgroundColor: color, borderColor: color } : { borderColor: color },
      ]}
    >
      <Text style={[TYPE.mark, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Круглый бейдж серии: «14 дней», «23 чистых». */
export function Badge({
  value,
  label,
  tone = 'sun',
  tilt = 0,
  size = 60,
}: {
  value: string | number;
  label: string;
  tone?: Tone;
  tilt?: number;
  size?: number;
}) {
  const p = usePalette();
  const fg = onTone(p, tone);
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: p[tone], borderColor: p.line },
        tiltStyle(tilt),
      ]}
    >
      <Text style={[TYPE.numberM, styles.badgeValue, { color: fg }]}>{value}</Text>
      <Text style={[TYPE.tiny, { color: fg }]}>{label}</Text>
    </View>
  );
}

/**
 * Цитата волка: волк и пузырь с хвостиком к нему. Без волка (`wolf={false}`) — просто пузырь,
 * когда волк уже нарисован рядом крупно («День закрыт»).
 */
export function WolfQuote({
  text,
  sign,
  mood = 'smirk',
  wolf = true,
  tone = 'tag',
}: {
  text: string;
  sign: string;
  mood?: WolfMood;
  wolf?: boolean;
  tone?: 'tag' | 'surface';
}) {
  const p = usePalette();
  return (
    <View style={styles.quote}>
      {wolf && <Wolf mood={mood} size={76} />}
      <View
        style={[
          styles.bubble,
          { backgroundColor: p[tone], borderColor: p.line },
          !wolf && styles.bubbleAlone,
        ]}
      >
        <Text style={[TYPE.quote, { color: p.text }]}>{text}</Text>
        <Text style={[TYPE.caption, { color: p.muted }]}>{sign}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: SPACE.lg },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    borderWidth: STROKE.outline,
    borderRadius: RADIUS.tag,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: STROKE.thin,
    borderRadius: RADIUS.pill,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: STROKE.outline,
    borderRadius: RADIUS.pill,
  },
  badgeValue: { lineHeight: 22 },
  quote: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.tight },
  bubbleAlone: { marginBottom: 0, borderBottomLeftRadius: 18 },
  bubble: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: SPACE.md,
    gap: SPACE.xs,
    borderWidth: STROKE.outline,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
});
