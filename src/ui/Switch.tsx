/** Переключатель — системный (iOS / Android / веб), только в цветах темы. */
import React from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';
import { usePalette } from '../store/themeStore';

type Props = { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean };

export function Switch({ value, onChange, label, disabled }: Props) {
  const p = usePalette();
  // На вебе цвет включённого бегунка задаётся отдельным свойством react-native-web.
  const web = Platform.OS === 'web' ? { activeThumbColor: p.bg, activeTrackColor: p.text } : null;
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      accessibilityLabel={label}
      trackColor={{ false: p.raised, true: p.text }}
      thumbColor={value ? p.bg : p.muted}
      ios_backgroundColor={p.raised}
      {...web}
    />
  );
}
