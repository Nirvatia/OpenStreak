import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FONT } from '../../theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCUMFERENCE = 169.6;

type Props = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  textColor?: string;
  showLabel?: boolean;
};

export const ProgressRing: React.FC<Props> = ({
  progress,
  size = 58,
  strokeWidth = 6,
  color,
  trackColor,
  textColor = '#000',
  showLabel = true,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const targetOffset = CIRCUMFERENCE * (1 - clamped);
  const offset = useSharedValue(CIRCUMFERENCE);

  useEffect(() => {
    offset.value = withTiming(targetOffset, {
      duration: 900,
      easing: Easing.bezier(0.25, 0.9, 0.3, 1),
    });
  }, [targetOffset, offset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={32}
          cy={32}
          r={27}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={32}
          cy={32}
          r={27}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
        />
      </Svg>
      {showLabel && (
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.label, { fontSize: 13 * (size / 58), color: textColor }]}>
            {Math.round(clamped * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // absoluteFillObject убрали из типов RN 0.86 — расписываем явно.
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontFamily: FONT.manrope.extrabold, fontWeight: '800' },
});
