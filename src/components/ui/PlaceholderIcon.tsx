import React from 'react';
import { Icons, SystemIconName } from '../icons/systemIcons';
import { AppIcons, AppIconName } from '../icons/appIcons';
import { HabitIcons, HabitIconName } from '../icons/habitIcons';

const SYSTEM_NAMES = new Set(Object.keys(Icons));
const APP_NAMES = new Set(Object.keys(AppIcons));
const HABIT_NAMES = new Set(Object.keys(HabitIcons));

// Record<string, string> — не привязываемся к union-типам,
// чтобы TS не падал на отсутствующие ключи.
const LEGACY_MAP: Record<string, string> = {
  sun: 'sun',
  moon: 'moon',
  today: 'nToday',
  tasks: 'nTasks',
  habits: 'nHab',
  count: 'nCount',
  stats: 'nStats',
  plus: 'plus',
  trash: 'trash',
  checkEmpty: 'check',
  checkDone: 'check',
  bulb: 'bulb',
  hello: 'hello',
  relief: 'relief',
  star: 'star',
  calendar: 'cal',
  flag: 'flag',
  bell: 'bell',
  note: 'note',
  search: 'search',
  chevronDown: 'chev',
  close: 'close',
  layers: 'layers',
  fire: 'fire',
  shield: 'shield',
  warning: 'warning',
  check: 'check',
  x: 'x',
  repeat: 'repeat',
  rest: 'palm',
  target: 'target',
  gift: 'gift',
  rocket: 'rocket',
  hourglass: 'hourglass',
};

type Props = { name: string; size?: number; color?: string };

export const PlaceholderIcon: React.FC<Props> = ({ name, size = 24, color }) => {
  const mapped = LEGACY_MAP[name] ?? name;

  if (SYSTEM_NAMES.has(mapped)) {
    const Cmp = Icons[mapped as SystemIconName] as React.ComponentType<{
      size?: number;
      color?: string;
    }>;
    return <Cmp size={size} color={color} />;
  }

  if (APP_NAMES.has(mapped)) {
    const Cmp = AppIcons[mapped as AppIconName] as React.ComponentType<{
      size?: number;
      sizeClass?: any;
    }>;
    return <Cmp size={size} />;
  }

  if (HABIT_NAMES.has(mapped)) {
    const Cmp = HabitIcons[mapped as HabitIconName] as React.ComponentType<{
      size?: number;
    }>;
    return <Cmp size={size} />;
  }

  return null;
};
