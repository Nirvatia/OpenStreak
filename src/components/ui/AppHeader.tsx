import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
};

export const AppHeader: React.FC<Props> = ({ title, subtitle }) => {
  const { currentTheme, toggleTheme, theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, backgroundColor: currentTheme.colors.bg },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: currentTheme.colors.muted }]}>{subtitle}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeButton, { backgroundColor: currentTheme.colors.card }]}
        >
          <Text style={styles.themeIcon}>{theme === 'light' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeIcon: { fontSize: 18 },
});
