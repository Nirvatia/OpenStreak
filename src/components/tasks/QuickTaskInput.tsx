import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useToastStore } from '../../store/toastStore';
import { useUiStore } from '../../store/uiStore';
import { SvgIcon } from '../icons/SvgIcon';

type Props = { presetDate?: string | null };

export const QuickTaskInput: React.FC<Props> = ({ presetDate }) => {
  const [value, setValue] = useState('');
  const { currentTheme } = useThemeStore();
  const addTask = useAppStore((s) => s.addTask);
  const showToast = useToastStore((s) => s.show);
  const areaFilter = useUiStore((s) => s.areaFilter);

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    addTask({ title: trimmed, date: presetDate ?? undefined, area: areaFilter });
    setValue('');
    showToast('Задача добавлена');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.iconWrap}>
        <SvgIcon name="plus" size={22} color={currentTheme.colors.accent} />
      </View>
      <TextInput
        style={[styles.input, { color: currentTheme.colors.text }]}
        placeholder="Добавить задачу…"
        placeholderTextColor={currentTheme.colors.muted}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        maxLength={120}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  iconWrap: { marginRight: 10 },
  input: { flex: 1, fontSize: 14.5, padding: 0 },
});
