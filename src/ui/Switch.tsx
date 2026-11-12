/** Переключатель — системный (iOS / Android / веб), в цветах темы: включён — бирюза («да»). */
import React from 'react';
import { Platform, Pressable, Switch as RNSwitch, View } from 'react-native';
import { usePalette, usePlain } from '../store/themeStore';
import { Icon } from './icons';

type Props = { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean };

export function Switch({ value, onChange, label, disabled }: Props) {
  const p = usePalette();
  const plain = usePlain();
  if (plain) {
    // «Обычный»: включён — залитая дорожка, бегунок справа с галочкой; выключен — пустая рамка,
    // бегунок слева. Состояние видно и без цвета: по положению и по галочке.
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={label}
        disabled={disabled}
        onPress={() => onChange(!value)}
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          borderWidth: 1.75,
          borderColor: p.line,
          backgroundColor: value ? p.line : 'transparent',
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            alignSelf: value ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: value ? p.bg : p.line,
          }}
        >
          {value && <Icon name="check" size={12} tone="text" />}
        </View>
      </Pressable>
    );
  }
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
