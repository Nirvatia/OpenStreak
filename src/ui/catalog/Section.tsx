import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../../store/themeStore';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';

/** Раздел каталога: подпись и содержимое. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const p = usePalette();
  return (
    <View style={styles.section}>
      <Text style={[TYPE.label, { color: p.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ section: { gap: SPACE.sm } });
