import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Particle = { id: number; dx: number; dy: number; color: string; size: number };
type Props = { x: number; y: number; color: string; trigger: number; onDone?: () => void };

const PARTICLES = 12;

export const Burst: React.FC<Props> = ({ x, y, color, trigger }) => {
  const particles: Particle[] = Array.from({ length: PARTICLES }).map((_, i) => {
    const a = (i / PARTICLES) * Math.PI * 2 + Math.random();
    const d = 38 + Math.random() * 46;
    return {
      id: i,
      dx: Math.cos(a) * d,
      dy: Math.sin(a) * d - 22,
      color: i % 3 === 0 ? color : '#2f7cf6',
      size: 5 + Math.random() * 5,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <ParticleItem key={`${trigger}-${p.id}`} p={p} x={x} y={y} />
      ))}
    </View>
  );
};

const ParticleItem: React.FC<{ p: Particle; x: number; y: number }> = ({ p, x, y }) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) });
  }, [t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: p.dx * t.value },
      { translateY: p.dy * t.value },
      { scale: 1 - t.value },
    ],
    opacity: 1 - t.value,
  }));

  return (
    <Animated.View
      style={[
        styles.spark,
        style,
        {
          left: x,
          top: y,
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
          backgroundColor: p.color,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({ spark: { position: 'absolute' } });
