import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { SvgIcon } from '../icons/SvgIcon';

type Props = {
  label: string;
  count: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  color?: string;
  children: React.ReactNode;
};

export const TaskGroup: React.FC<Props> = ({
  label,
  count,
  collapsible = false,
  collapsed = false,
  onToggle,
  color,
  children,
}) => {
  const { currentTheme } = useThemeStore();
  if (count === 0) return null;

  return (
    <View style={styles.container}>
      {collapsible ? (
        <TouchableOpacity style={styles.labelRow} onPress={onToggle} activeOpacity={0.7}>
          <Text style={[styles.label, { color: color || currentTheme.colors.muted }]}>{label}</Text>
          <View style={[styles.count, { backgroundColor: currentTheme.colors.card2 }]}>
            <Text style={[styles.countText, { color: currentTheme.colors.muted }]}>{count}</Text>
          </View>
          <View style={[styles.chevWrap, collapsed && styles.chevCollapsed]}>
            <SvgIcon name="chev" size={18} color={currentTheme.colors.muted} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: color || currentTheme.colors.muted }]}>{label}</Text>
          <View style={[styles.count, { backgroundColor: currentTheme.colors.card2 }]}>
            <Text style={[styles.countText, { color: currentTheme.colors.muted }]}>{count}</Text>
          </View>
        </View>
      )}
      {!collapsed && children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 4,
  },
  label: { fontSize: 13, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  count: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 1 },
  countText: { fontSize: 12, fontWeight: '600' },
  chevWrap: { marginLeft: 'auto', transform: [{ rotate: '0deg' }] },
  chevCollapsed: { transform: [{ rotate: '-90deg' }] },
});
