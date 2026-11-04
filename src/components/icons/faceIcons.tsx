import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ICON_SIZES } from '../../theme/iconSizes';

export type MoodType = 'laugh' | 'smile' | 'neutral' | 'sad' | 'angry';

type SizeClass = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<SizeClass, number> = ICON_SIZES.face;
const INK = '#10181d';

const MOOD_COLORS: Record<MoodType, string> = {
  laugh: '#18a98d',
  smile: '#7cba2f',
  neutral: '#3f90bf',
  sad: '#ee8523',
  angry: '#e21e3b',
};

type Props = { type: MoodType; sizeClass?: SizeClass };

export const FaceIcons: React.FC<Props> = ({ type, sizeClass = 'md' }) => {
  const s = SIZE_MAP[sizeClass];
  const bg = MOOD_COLORS[type];
  const eyeSize = s * 0.11;

  const renderEyes = () => {
    if (type === 'laugh') {
      return (
        <>
          <View
            style={[
              styles.eyeArc,
              {
                top: s * 0.37,
                left: s * 0.19,
                width: s * 0.22,
                height: s * 0.11,
                borderTopWidth: s * 0.04,
                borderColor: INK,
                borderTopLeftRadius: s * 0.11,
                borderTopRightRadius: s * 0.11,
                transform: [{ rotate: '-14deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.eyeArc,
              {
                top: s * 0.37,
                right: s * 0.19,
                width: s * 0.22,
                height: s * 0.11,
                borderTopWidth: s * 0.04,
                borderColor: INK,
                borderTopLeftRadius: s * 0.11,
                borderTopRightRadius: s * 0.11,
                transform: [{ rotate: '14deg' }],
              },
            ]}
          />
        </>
      );
    }
    return (
      <>
        <View
          style={[
            styles.dot,
            {
              width: eyeSize,
              height: eyeSize,
              borderRadius: eyeSize / 2,
              top: s * 0.4,
              left: s * 0.24,
              backgroundColor: INK,
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: eyeSize,
              height: eyeSize,
              borderRadius: eyeSize / 2,
              top: s * 0.4,
              right: s * 0.24,
              backgroundColor: INK,
            },
          ]}
        />
      </>
    );
  };

  const renderMouth = () => {
    switch (type) {
      case 'laugh':
        return (
          <View
            style={[
              styles.mouth,
              {
                left: s * 0.24,
                top: s * 0.48,
                width: s * 0.52,
                height: s * 0.34,
                backgroundColor: INK,
                borderBottomLeftRadius: s * 0.26,
                borderBottomRightRadius: s * 0.26,
                borderTopLeftRadius: s * 0.09,
                borderTopRightRadius: s * 0.09,
                overflow: 'hidden',
              },
            ]}
          >
            <View
              style={{
                position: 'absolute',
                left: s * 0.09,
                top: s * 0.21,
                width: s * 0.34,
                height: s * 0.26,
                borderRadius: s * 0.17,
                backgroundColor: '#2ec4a5',
              }}
            />
          </View>
        );
      case 'smile':
        return (
          <View
            style={[
              styles.smileLine,
              {
                left: s * 0.37,
                top: s * 0.52,
                width: s * 0.26,
                height: s * 0.12,
                borderBottomWidth: s * 0.04,
                borderColor: INK,
                borderBottomLeftRadius: s * 0.14,
                borderBottomRightRadius: s * 0.14,
              },
            ]}
          />
        );
      case 'neutral':
        return (
          <View
            style={[
              styles.neutralLine,
              {
                left: s * 0.35,
                top: s * 0.58,
                width: s * 0.3,
                height: s * 0.04,
                backgroundColor: INK,
                borderRadius: s * 0.02,
              },
            ]}
          />
        );
      case 'sad':
        return (
          <View
            style={[
              styles.sadMouth,
              {
                left: s * 0.32,
                top: s * 0.6,
                width: s * 0.36,
                height: s * 0.18,
                borderTopWidth: s * 0.04,
                borderColor: INK,
                borderTopLeftRadius: s * 0.18,
                borderTopRightRadius: s * 0.18,
              },
            ]}
          />
        );
      case 'angry':
        return (
          <View
            style={[
              styles.sadMouth,
              {
                left: s * 0.34,
                top: s * 0.62,
                width: s * 0.32,
                height: s * 0.16,
                borderTopWidth: s * 0.04,
                borderColor: INK,
                borderTopLeftRadius: s * 0.16,
                borderTopRightRadius: s * 0.16,
              },
            ]}
          />
        );
    }
  };

  const renderBrows = () => {
    if (type !== 'sad' && type !== 'angry') return null;
    const rot = type === 'sad' ? { l: '-8deg', r: '8deg' } : { l: '18deg', r: '-18deg' };
    return (
      <>
        <View
          style={[
            styles.brow,
            {
              top: s * 0.26,
              left: s * 0.24,
              width: s * 0.18,
              height: s * 0.09,
              borderTopWidth: s * 0.04,
              borderColor: INK,
              borderTopLeftRadius: s * 0.09,
              borderTopRightRadius: s * 0.09,
              transform: [{ rotate: rot.l }],
            },
          ]}
        />
        <View
          style={[
            styles.brow,
            {
              top: s * 0.26,
              right: s * 0.24,
              width: s * 0.18,
              height: s * 0.09,
              borderTopWidth: s * 0.04,
              borderColor: INK,
              borderTopLeftRadius: s * 0.09,
              borderTopRightRadius: s * 0.09,
              transform: [{ rotate: rot.r }],
            },
          ]}
        />
      </>
    );
  };

  return (
    <View style={[styles.wrap, { width: s, height: s, borderRadius: s / 2, backgroundColor: bg }]}>
      {renderBrows()}
      {renderEyes()}
      {renderMouth()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
  dot: { position: 'absolute' },
  eyeArc: { position: 'absolute', backgroundColor: 'transparent' },
  brow: { position: 'absolute', backgroundColor: 'transparent' },
  mouth: { position: 'absolute' },
  smileLine: { position: 'absolute', backgroundColor: 'transparent' },
  neutralLine: { position: 'absolute' },
  sadMouth: { position: 'absolute', backgroundColor: 'transparent' },
});
