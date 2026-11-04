import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { MOOD_ORDER } from '../../utils/moods';
import { MoodFace } from './MoodFace';

type Props = { selected: number; onSelect: (mood: number) => void };

export const MoodPicker: React.FC<Props> = ({ selected, onSelect }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={styles.row}>
      {MOOD_ORDER.map((m) => (
        <TouchableOpacity
          key={m}
          style={[
            styles.button,
            selected === m && {
              backgroundColor: currentTheme.colors.accentSoft,
              transform: [{ scale: 1.15 }],
            },
          ]}
          onPress={() => onSelect(m)}
          activeOpacity={0.7}
        >
          <MoodFace mood={m} size="lg" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  button: { padding: 6, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
