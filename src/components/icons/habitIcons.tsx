import React from 'react';
import Svg, { Circle, Path, Rect, G, Ellipse } from 'react-native-svg';

type P = { size?: number };
const sz = (p: P) => p.size ?? 26;

export const HabitIcons = {
  drop: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={15} fill="#FFD93B" />
      <Circle cx={26.5} cy={28} r={2.2} fill="#E8A400" />
      <Circle cx={37.5} cy={28} r={2.2} fill="#E8A400" />
      <Path
        d="M25 35q7 7 14 0"
        stroke="#E8A400"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  activity: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M26 12 L28 26 M38 12 L36 26"
        stroke="#EF5350"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Path d="M26 12 L38 12" stroke="#EF5350" strokeWidth={5} strokeLinecap="round" />
      <Circle cx={32} cy={38} r={14} fill="#FFD54F" stroke="#FFA000" strokeWidth={2.5} />
      <Circle cx={32} cy={38} r={9} fill="none" stroke="#FFA000" strokeWidth={2} />
      <Path
        d="M28 38 L31 41 L37 34"
        stroke="#BF6900"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  dumbbell: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={2} y={14} width={8} height={36} rx={3} fill="#37474F" />
      <Rect x={10} y={20} width={6} height={24} rx={2} fill="#546E7A" />
      <Path d="M16 32 L48 32" stroke="#90A4AE" strokeWidth={4} strokeLinecap="round" />
      <Rect x={48} y={20} width={6} height={24} rx={2} fill="#546E7A" />
      <Rect x={54} y={14} width={8} height={36} rx={3} fill="#37474F" />
    </Svg>
  ),
  book: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M32 18q-8-5-16-3v26q8-2 16 3 8-5 16-3V15q-8-2-16 3z" fill="#FFF" />
      <Path d="M32 18v26" stroke="#BBDEFB" strokeWidth={2} />
      <Path
        d="M19 24h9M19 30h9M19 36h7M36 24h9M36 30h9M36 36h7"
        stroke="#90CAF9"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  ),
  lotus: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={44} rx={16} ry={5} fill="#F48FB1" />
      <Path d="M32 44 Q24 28 32 14 Q40 28 32 44Z" fill="#FFF" />
      <Path d="M32 44 Q20 36 14 24 Q24 28 32 44Z" fill="#FCE4EC" />
      <Path d="M32 44 Q44 36 50 24 Q40 28 32 44Z" fill="#FCE4EC" />
      <Path d="M32 44 Q16 42 8 36 Q18 38 32 44Z" fill="#F8BBD0" />
      <Path d="M32 44 Q48 42 56 36 Q46 38 32 44Z" fill="#F8BBD0" />
      <Circle cx={32} cy={32} r={2} fill="#FFD54F" />
    </Svg>
  ),
  apple: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={22} r={4.5} fill="#7E57C2" />
      <Circle cx={25} cy={28} r={4.5} fill="#7E57C2" />
      <Circle cx={39} cy={28} r={4.5} fill="#7E57C2" />
      <Circle cx={21} cy={35} r={4.5} fill="#5E35B1" />
      <Circle cx={32} cy={35} r={4.5} fill="#7E57C2" />
      <Circle cx={43} cy={35} r={4.5} fill="#5E35B1" />
      <Circle cx={25} cy={42} r={4.5} fill="#5E35B1" />
      <Circle cx={39} cy={42} r={4.5} fill="#5E35B1" />
      <Circle cx={32} cy={49} r={4.5} fill="#5E35B1" />
      <Path d="M32 17.5 L32 10" stroke="#8D6E63" strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M32 12 Q38 10 40 12"
        stroke="#66BB6A"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  moonstar: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M40 14a16 16 0 1 0 10 30 14 14 0 0 1-10-30z" fill="#FFD54F" />
      <Path
        d="M14 22h8l-8 8h8"
        stroke="#FFF"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26 38h6l-6 6h6"
        stroke="#FFF"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  pencil: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <G transform="rotate(45 32 32)">
        <Rect x={28} y={10} width={8} height={7} rx={2} fill="#F48FB1" />
        <Rect x={28} y={16} width={8} height={4} fill="#90A4AE" />
        <Rect x={28} y={20} width={8} height={22} fill="#FFA726" />
        <Path d="M28 42h8l-4 10z" fill="#FFCC80" />
        <Path d="M30.5 48l1.5 4 1.5-4z" fill="#546E7A" />
      </G>
    </Svg>
  ),
  target: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={18} fill="#FFF" />
      <Circle cx={32} cy={32} r={14} fill="none" stroke="#EF5350" strokeWidth={3} />
      <Circle cx={32} cy={32} r={9} fill="none" stroke="#EF5350" strokeWidth={3} />
      <Circle cx={32} cy={32} r={4} fill="#EF5350" />
    </Svg>
  ),
  sparkles: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M14 42a18 18 0 0 1 36 0"
        fill="none"
        stroke="#EF5350"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M18 42a14 14 0 0 1 28 0"
        fill="none"
        stroke="#FFCA28"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M22 42a10 10 0 0 1 20 0"
        fill="none"
        stroke="#66BB6A"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={14} cy={42} r={4} fill="#FFF" />
      <Circle cx={50} cy={42} r={4} fill="#FFF" />
    </Svg>
  ),
  medplus: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={14} y={16} width={36} height={30} rx={8} fill="#FFF" />
      <Path d="M26 46l-4 8-2-8z" fill="#FFF" />
      <Path
        d="M32 36c-6-4-9-7-9-10 0-2.5 2-4.5 4.5-4.5 1.5 0 3 1 4 2.5 1-1.5 2.5-2.5 4-2.5 2.5 0 4.5 2 4.5 4.5 0 3-3 6-9 10z"
        fill="#EF5350"
      />
    </Svg>
  ),
  sprout: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={50} rx={11} ry={4} fill="#8D6E63" />
      <Path d="M32 48 V34" stroke="#66BB6A" strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M32 36 Q20 34 18 22 Q30 24 32 36z" fill="#81C784" />
      <Path d="M32 36 Q42 34 44 24 Q34 26 32 36z" fill="#66BB6A" />
    </Svg>
  ),
  shield: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
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
  ),
  phoneoff: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={22} y={12} width={20} height={36} rx={4} fill="#B0BEC5" />
      <Rect x={25} y={17} width={14} height={22} rx={2} fill="#ECEFF1" />
      <Circle cx={32} cy={44} r={2} fill="#78909C" />
      <G stroke="#E53935" strokeWidth={4} fill="none" strokeLinecap="round">
        <Circle cx={44} cy={44} r={10} />
        <Path d="M37 37l14 14" />
      </G>
    </Svg>
  ),
  compass: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={16} y={14} width={32} height={38} rx={4} fill="#E3F2FD" />
      <Rect x={24} y={10} width={16} height={8} rx={3} fill="#64B5F6" />
      <Path d="M22 32h8M22 38h12M22 44h10" stroke="#90CAF9" strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M36 28l4 4 8-8"
        stroke="#FFA726"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  bulb: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
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
  ),
  clock: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={9} fill="#FF8A65" />
      <Path
        d="M32 14v6M32 44v6M14 32h6M44 32h6M19.5 19.5l4 4M40.5 40.5l4 4M44.5 19.5l-4 4M19.5 44.5l4-4"
        stroke="#FF8A65"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  ),
  wallet: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={14} y={18} width={36} height={18} rx={3} fill="#A5D6A7" />
      <Rect x={12} y={26} width={40} height={22} rx={4} fill="#66BB6A" />
      <Circle cx={32} cy={37} r={7} fill="#E8F5E9" />
    </Svg>
  ),
  trip: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
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
  ),
  water: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M22 16h20l-2 32H24z" fill="#E3F2FD" />
      <Path d="M24 24h16l-2 22H26z" fill="#42A5F5" />
      <Circle cx={28} cy={32} r={1.5} fill="#BBDEFB" />
      <Circle cx={34} cy={38} r={1} fill="#BBDEFB" />
      <Circle cx={30} cy={44} r={1.2} fill="#BBDEFB" />
      <Path d="M22 16h20" stroke="#90CAF9" strokeWidth={2} />
    </Svg>
  ),
  breakfast: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M18 26a6 6 0 0 1 6-6c3 0 4 1 7 1s4-1 7-1a6 6 0 0 1 6 6v18a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"
        fill="#FFF8E1"
      />
      <Circle cx={31} cy={34} r={7} fill="#FFF" />
      <Circle cx={31} cy={34} r={3} fill="#FFB300" />
      <Path
        d="M44 30a5 5 0 0 1 0 10"
        fill="none"
        stroke="#FFF8E1"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  ),
  healthyfood: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M32 14 C20 14, 16 26, 16 34 C16 46, 24 52, 32 52 C40 52, 48 46, 48 34 C48 22, 44 14, 32 14 Z"
        fill="#EF5350"
      />
      <Ellipse cx={24} cy={28} rx={3} ry={5} fill="rgba(255,255,255,0.35)" />
      <Path d="M32 14 Q36 6, 42 8 Q40 14, 32 14 Z" fill="#66BB6A" />
    </Svg>
  ),
  fruits: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={22} r={4.5} fill="#7E57C2" />
      <Circle cx={25} cy={28} r={4.5} fill="#7E57C2" />
      <Circle cx={39} cy={28} r={4.5} fill="#7E57C2" />
      <Circle cx={21} cy={35} r={4.5} fill="#5E35B1" />
      <Circle cx={32} cy={35} r={4.5} fill="#7E57C2" />
      <Circle cx={43} cy={35} r={4.5} fill="#5E35B1" />
      <Circle cx={25} cy={42} r={4.5} fill="#5E35B1" />
      <Circle cx={39} cy={42} r={4.5} fill="#5E35B1" />
      <Circle cx={32} cy={49} r={4.5} fill="#5E35B1" />
      <Path d="M32 17.5 L32 10" stroke="#8D6E63" strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M32 12 Q38 10 40 12"
        stroke="#66BB6A"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  vegetables: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M42 24l8 8L26 48q-6 4-4-2z"
        fill="#FF7043"
        stroke="#FF7043"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M34 34l4 4M30 39l3 3" stroke="#E64A19" strokeWidth={2.5} strokeLinecap="round" />
      <Path
        d="M44 23q2-8 10-8M44 23q8-1 10 5"
        stroke="#43A047"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  shower: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M20 28a12 12 0 0 1 24 0z" fill="#ECEFF1" />
      <Path
        d="M32 18v-2q0-5 6-5"
        stroke="#B0BEC5"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 34v6M28 34v8M34 34v8M40 34v6"
        stroke="#4FC3F7"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  ),
  video: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={14} y={20} width={36} height={26} rx={4} fill="#FFCC80" />
      <Rect x={18} y={24} width={28} height={18} rx={2} fill="#FFF" />
      <Path d="M28 28l10 5-10 5z" fill="#EF5350" />
      <Path
        d="M24 14l8 6 8-6"
        stroke="#FFCC80"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  nosmoking: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={12} y={30} width={28} height={8} rx={3} fill="#FFF" />
      <Rect x={40} y={30} width={10} height={8} rx={3} fill="#FF7043" />
      <Path
        d="M45 26q3-3 0-6"
        stroke="#B0BEC5"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <G stroke="#E53935" strokeWidth={4} fill="none" strokeLinecap="round">
        <Circle cx={42} cy={44} r={10} />
        <Path d="M35 37l14 14" />
      </G>
    </Svg>
  ),
  noalcohol: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M26 12h12v8c0 4 5 6 5 12v18a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V32c0-6 5-8 5-12z"
        fill="#388E3C"
      />
      <Rect x={25} y={34} width={14} height={10} rx={2} fill="#E8F5E9" />
      <G stroke="#E53935" strokeWidth={4} fill="none" strokeLinecap="round">
        <Circle cx={44} cy={44} r={10} />
        <Path d="M37 37l14 14" />
      </G>
    </Svg>
  ),
  music: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={16} fill="#37474F" />
      <Circle cx={32} cy={32} r={12} fill="none" stroke="#546E7A" strokeWidth={1.5} />
      <Circle cx={32} cy={32} r={8} fill="none" stroke="#546E7A" strokeWidth={1.5} />
      <Circle cx={32} cy={32} r={4} fill="#546E7A" />
      <Circle cx={32} cy={32} r={1.5} fill="#37474F" />
      <Path d="M36 24l-8 2.5V36" fill="none" stroke="#FFF" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={26} cy={36} r={3.5} fill="#FFF" />
      <Path d="M36 24q4 2 3 6" fill="none" stroke="#FFF" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  ),
  cinema: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={14} y={28} width={28} height={20} rx={3} fill="#5D4037" />
      <Path d="M14 26l26-8 2 6-26 8z" fill="#3E2723" />
      <Circle cx={44} cy={34} r={3} fill="#FFF" />
      <Circle cx={44} cy={42} r={3} fill="#FFF" />
      <Path
        d="M20 24l2 6M26 22l2 6M32 20l2 6"
        stroke="#FFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  ),
  swimming: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Ellipse cx={22} cy={32} rx={9} ry={7} fill="none" stroke="#FFF" strokeWidth={3.5} />
      <Ellipse cx={42} cy={32} rx={9} ry={7} fill="none" stroke="#FFF" strokeWidth={3.5} />
      <Path d="M31 32 L33 32" stroke="#FFF" strokeWidth={3.5} />
      <Path d="M13 32 L7 30" stroke="#FFF" strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M51 32 L57 30" stroke="#FFF" strokeWidth={3.5} strokeLinecap="round" />
      <Ellipse cx={22} cy={32} rx={6} ry={4.5} fill="#4FC3F7" />
      <Ellipse cx={42} cy={32} rx={6} ry={4.5} fill="#4FC3F7" />
    </Svg>
  ),
  running: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <G stroke="#FFFFFF" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={47} cy={13} r={5} fill="#FFFFFF" stroke="none" />
        <Path d="M23.5 22.5 L32.5 12.5 L39.5 16" strokeWidth={5} />
        <Path d="M42.5 18.5 L31 32 L42 41.5 L29.5 54 M31 32 L12.5 52" strokeWidth={6} />
        <Path d="M42.5 21.5 L42.5 30 L54 30" strokeWidth={6} />
        <Path d="M10.5 14.5h7.5M8 20.5h7.5M10.5 26.5h7.5" strokeWidth={4} />
      </G>
    </Svg>
  ),
  breathing: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M12 24h18a5 5 0 1 0-5-7"
        fill="none"
        stroke="#FFF"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M12 36h26a5 5 0 1 1-5 7"
        fill="none"
        stroke="#FFF"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={44} cy={19} r={3} fill="#FFF" />
      <Circle cx={44} cy={45} r={3} fill="#FFF" />
    </Svg>
  ),
  languages: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M32 18q-8-5-16-3v26q8-2 16 3 8-5 16-3V15q-8-2-16 3z" fill="#FFF" />
      <Path d="M32 18v26" stroke="#BBDEFB" strokeWidth={2} />
      <Path d="M38 24h8M38 30h8M38 36h6" stroke="#90CAF9" strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  ),
  compliments: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path
        d="M20 28l8-12a4 4 0 0 1 5 4l-2 8h10a4 4 0 0 1 4 4l-2 10a5 5 0 0 1-5 4H20z"
        fill="#FFF3E0"
      />
      <Path d="M20 28v18h-4a3 3 0 0 1-3-3V31a3 3 0 0 1 3-3z" fill="#FFCC80" />
      <Path d="M26 36h14M26 40h10" stroke="#FFB74D" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  ),
  vitamins: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <G transform="rotate(-30 32 32)">
        <Path d="M32 25H22a7 7 0 0 0 0 14h10z" fill="#FFF" />
        <Path d="M32 25h10a7 7 0 0 1 0 14H32z" fill="#EF5350" />
      </G>
    </Svg>
  ),
  dog: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Rect x={16} y={28} width={24} height={14} rx={7} fill="#FFF" />
      <Circle cx={42} cy={26} r={8} fill="#FFF" />
      <Path
        d="M16 30q-7-2-5-10"
        stroke="#FFF"
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M20 42v8M36 42v8" stroke="#FFF" strokeWidth={4.5} strokeLinecap="round" />
      <Circle cx={44} cy={25} r={1.5} fill="#5D4037" />
      <Path
        d="M40 18Q48 10 52 12"
        stroke="#EF5350"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  cat: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M24 46q-4-18 10-20 14-2 14 10v10z" fill="#FFF" />
      <Circle cx={38} cy={22} r={8} fill="#FFF" />
      <Path d="M32 16l-2-8 7 5zM44 16l2-8-7 5z" fill="#FFF" />
      <Path
        d="M24 46q-10 0-8-10"
        stroke="#FFF"
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={35} cy={21} r={1.5} fill="#5D4037" />
      <Circle cx={41} cy={21} r={1.5} fill="#5D4037" />
      <Path
        d="M36 26l2 1 2-1"
        stroke="#F48FB1"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  ),
  cleaning: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      <Path d="M32 10 L32 34" stroke="#8D6E63" strokeWidth={5} strokeLinecap="round" />
      <Path d="M22 34 L42 34 L44 54 L20 54 Z" fill="#FFCA28" />
      <Path
        d="M24 38 L24 52 M28 38 L28 54 M32 38 L32 54 M36 38 L36 54 M40 38 L40 52"
        stroke="#F57F17"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  ),
  palm: ({ size }: P) => (
    <Svg width={sz({ size })} height={sz({ size })} viewBox="0 0 64 64">
      {/* Листья: четыре пера из одной точки кроны */}
      <Path d="M33 27C26 26 16 30 11 38c7-5 15-7 22-6z" fill="#43A047" />
      <Path d="M34 27c7-1 17 3 22 11-7-5-15-7-22-6z" fill="#43A047" />
      <Path d="M33 26c-5-6-11-10-18-11 6 5 12 8 17 13z" fill="#66BB6A" />
      <Path d="M34 26c5-6 11-10 18-11-6 5-12 8-17 13z" fill="#66BB6A" />
      {/* Ствол — изогнутый, входит в крону */}
      <Path
        d="M31 56c0-10 1-19 3-27"
        stroke="#8D6E63"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Кокосы */}
      <Circle cx={30} cy={30} r={2.4} fill="#6D4C41" />
      <Circle cx={36} cy={30} r={2.4} fill="#6D4C41" />
    </Svg>
  ),
};

export type HabitIconName = keyof typeof HabitIcons;

/** Иконки, доступные пользователю в списке выбора.
 *  `palm` объявлена последней — значит и в сетке она последняя. */
export const HABIT_ICON_KEYS = Object.keys(HabitIcons) as HabitIconName[];
