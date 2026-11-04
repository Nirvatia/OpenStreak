import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { SvgIcon } from '../icons/SvgIcon';

type Props = { value: string; onChangeText: (text: string) => void };

export const SearchInput: React.FC<Props> = ({ value, onChangeText }) => {
  const { currentTheme } = useThemeStore();
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <SvgIcon name="search" size={20} color={currentTheme.colors.muted} />
      <TextInput
        style={[styles.input, { color: currentTheme.colors.text }]}
        placeholder="Поиск задач…"
        placeholderTextColor={currentTheme.colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 14.5, padding: 0 },
});

export default SearchInput;
