/** Переключатель — системный (iOS / Android / веб), в цветах темы: включён — бирюза («да»). */
import React from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';
import { usePalette } from '../store/themeStore';

type Props = { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean };

export function Switch({ value, onChange, label, disabled }: Props) {
  const p = usePalette();
  // На вебе цвет включённого бегунка задаётся отдельным свойством react-native-web.
  const web =
    Platform.OS === 'web' ? { activeThumbColor: p.knobOn, activeTrackColor: p.teal } : null;
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      accessibilityLabel={label}
      trackColor={{ false: p.track, true: p.teal }}
      thumbColor={value ? p.knobOn : p.knobOff}
      ios_backgroundColor={p.track}
      {...web}
    />
  );
}
