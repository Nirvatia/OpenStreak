import React from 'react';
import Svg, { Circle, Path, Rect, G, Ellipse } from 'react-native-svg';
import { ICON_SIZES } from '../../theme/iconSizes';

type SizeClass = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<SizeClass, number> = ICON_SIZES.app;

type P = { sizeClass?: SizeClass; size?: number };
const sz = (p: P) => p.size ?? SIZE_MAP[p.sizeClass ?? 'md'];

export const AppIcons = {
  check: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#66BB6A" />
        <Path
          d="M19 33 L28 42 L45 23"
          fill="none"
          stroke="#FFF"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  },
  x: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#EF5350" />
        <Path d="M22 22 L42 42 M42 22 L22 42" stroke="#FFF" strokeWidth={7} strokeLinecap="round" />
      </Svg>
    );
  },
  palm: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#80DEEA" />
        <Ellipse cx={32} cy={50} rx={15} ry={4.5} fill="#FFE082" />
        <Path
          d="M31 50 Q29 38 33 28"
          stroke="#8D6E63"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <G stroke="#43A047" strokeWidth={4} fill="none" strokeLinecap="round">
          <Path d="M33 28 Q23 22 15 27" />
          <Path d="M33 28 Q27 16 18 14" />
          <Path d="M33 28 Q39 16 48 14" />
          <Path d="M33 28 Q43 22 51 27" />
        </G>
        <Circle cx={33} cy={30} r={2.5} fill="#6D4C41" />
      </Svg>
    );
  },
  fire: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#F28B82" />
        <Path
          d="M32 10c7 9 12 15 12 25a12 12 0 0 1-24 0c0-6 3-11 7-15 1 4 3 7 6 8-3-7-3-12-1-18z"
          fill="#FF7043"
        />
        <Path d="M32 32c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill="#FFD54F" />
      </Svg>
    );
  },
  shield: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#B39DDB" />
        <Path d="M32 10l16 6v13c0 12-7 20-16 25-9-5-16-13-16-25V16z" fill="#42A5F5" />
        <Path
          d="M24 31l6 6 11-12"
          stroke="#FFF"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  },
  warning: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#FFD54F" />
        <Path
          d="M32 12 L54 50 H10 Z"
          fill="#EF5350"
          stroke="#EF5350"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <Rect x={29.5} y={24} width={5} height={14} rx={2.5} fill="#FFF" />
        <Circle cx={32} cy={44} r={3} fill="#FFF" />
      </Svg>
    );
  },
  target: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#CE93D8" />
        <Circle cx={30} cy={34} r={17} fill="#FFF" />
        <Circle cx={30} cy={34} r={12.5} fill="#EF5350" />
        <Circle cx={30} cy={34} r={8} fill="#FFF" />
        <Circle cx={30} cy={34} r={3.5} fill="#EF5350" />
        <Path d="M46 18 L31 33" stroke="#37474F" strokeWidth={3} strokeLinecap="round" />
        <Path d="M46 18 l7-3 -3 7z" fill="#FFA726" />
      </Svg>
    );
  },
  gift: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#9CCC65" />
        <Rect x={17} y={30} width={30} height={20} rx={3} fill="#EF5350" />
        <Rect x={15} y={25} width={34} height={7} rx={2.5} fill="#E57373" />
        <Rect x={29.5} y={25} width={5} height={25} fill="#FFD54F" />
        <Path d="M32 25 q-9-11 -13-5 q-3 6 13 5z" fill="#FFD54F" />
        <Path d="M32 25 q9-11 13-5 q3 6 -13 5z" fill="#FFD54F" />
      </Svg>
    );
  },
  hourglass: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#80DEEA" />
        <Rect x={17} y={10} width={30} height={5} rx={2.5} fill="#546E7A" />
        <Rect x={17} y={49} width={30} height={5} rx={2.5} fill="#546E7A" />
        <Path d="M22 15h20v7q0 6-10 10-10-4-10-10z" fill="#E1F5FE" />
        <Path d="M22 49h20v-7q0-6-10-10-10 4-10 10z" fill="#E1F5FE" />
        <Path d="M26 18h12q-1 5-6 7-5-2-6-7z" fill="#FFD54F" />
        <Path d="M32 30v6" stroke="#FFD54F" strokeWidth={2} strokeLinecap="round" />
        <Path d="M32 36l7 10H25z" fill="#FFD54F" />
      </Svg>
    );
  },
  rocket: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#7986CB" />
        <Path d="M32 8 q9 9 9 21 v9 h-18 v-9 q0-12 9-21z" fill="#ECEFF1" />
        <Circle cx={32} cy={26} r={4.5} fill="#4FC3F7" />
        <Path d="M23 34 l-7 12 7-3z" fill="#EF5350" />
        <Path d="M41 34 l7 12 -7-3z" fill="#EF5350" />
        <Path d="M27 40 h10 l-5 12z" fill="#FFA726" />
        <Path d="M30 40 h4 l-2 6z" fill="#FFD54F" />
      </Svg>
    );
  },
  cake: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#F48FB1" />
        <Rect x={14} y={48} width={36} height={4} rx={2} fill="#EF5350" />
        <Rect x={18} y={34} width={28} height={14} rx={3} fill="#FFCC80" />
        <Rect x={18} y={32} width={28} height={7} rx={3.5} fill="#FFF" />
        <Circle cx={24} cy={41} r={3} fill="#FFF" />
        <Circle cx={32} cy={42} r={3} fill="#FFF" />
        <Circle cx={40} cy={41} r={3} fill="#FFF" />
        <Rect x={30.5} y={22} width={3} height={10} rx={1.5} fill="#4FC3F7" />
        <Path d="M32 14 q3 4 0 7 q-3-3 0-7z" fill="#FFA726" />
      </Svg>
    );
  },
  bulb: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Path
          d="M32 6v5 M12 26h5 M47 26h5 M18 12l4 4 M46 12l-4 4"
          stroke="#FFA726"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx={32} cy={27} r={11} fill="#FFF" />
        <Path
          d="M29 27 l3 4 3-4"
          stroke="#FFA726"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Rect x={27} y={36} width={10} height={5} rx={2} fill="#90A4AE" />
        <Rect x={28.5} y={43} width={7} height={3.5} rx={1.75} fill="#78909C" />
      </Svg>
    );
  },
  star: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#7986CB" />
        <Path
          d="M32 16 l5 10 11 1.6 -8 7.8 1.9 11 -9.9 -5.2 -9.9 5.2 1.9 -11 -8 -7.8 11 -1.6z"
          fill="#FFD54F"
        />
        <Path d="M12 20h6M15 17v6" stroke="#FFF" strokeWidth={2} strokeLinecap="round" />
        <Path d="M49 40h6M52 37v6" stroke="#FFF" strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  },
  sprout: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#A5D6A7" />
        <Ellipse cx={32} cy={50} rx={11} ry={4} fill="#8D6E63" />
        <Path d="M32 48 V34" stroke="#66BB6A" strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M32 36 Q20 34 18 22 Q30 24 32 36z" fill="#81C784" />
        <Path d="M32 36 Q42 34 44 24 Q34 26 32 36z" fill="#66BB6A" />
      </Svg>
    );
  },
  relief: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#80DEEA" />
        <Circle cx={32} cy={32} r={16} fill="#FFD54F" />
        <Path
          d="M24 29 q3 3.5 6 0 M34 29 q3 3.5 6 0"
          stroke="#E8A400"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M26 38 q6 5 12 0"
          stroke="#E8A400"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={22} cy={35} r={2.5} fill="#FFB74D" />
        <Circle cx={42} cy={35} r={2.5} fill="#FFB74D" />
      </Svg>
    );
  },
  hello: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#FFCC80" />
        <Rect x={20.5} y={34} width={22} height={13} rx={5} fill="#FFF" />
        <Path
          d="M23 36V19M28.5 36V16M34 36V18M39.5 36V23"
          stroke="#FFF"
          strokeWidth={4.5}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M20.5 40L13 34" stroke="#FFF" strokeWidth={4.5} strokeLinecap="round" />
        <Path
          d="M47 20q5 6 0 12M52 16q7 9 0 18"
          stroke="#EF5350"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    );
  },
  moon: ({ sizeClass, size }: P) => {
    const s = sz({ sizeClass, size });
    return (
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={32} fill="#7986CB" />
        <Path d="M40 14a16 16 0 1 0 10 30 14 14 0 0 1-10-30z" fill="#FFD54F" />
        <Circle cx={18} cy={22} r={2} fill="#FFF" />
        <Circle cx={26} cy={40} r={1.5} fill="#FFF" />
        <Path d="M14 32h6M17 29v6" stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    );
  },
};

export type AppIconName = keyof typeof AppIcons;
