import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useUiStore } from '../../store/uiStore';
import { SvgIcon } from '../icons/SvgIcon';
import { ICON_SIZES } from '../../theme/iconSizes';

type Props = { onPress?: () => void };

export const Fab: React.FC<Props> = ({ onPress }) => {
  const { currentTheme } = useThemeStore();
  const openTaskSheet = useUiStore((s) => s.openTaskSheet);
  const taskSheetVisible = useUiStore((s) => s.taskSheetVisible);
  const habitSheetVisible = useUiStore((s) => s.habitSheetVisible);
  const areasSheetVisible = useUiStore((s) => s.areasSheetVisible);
  const areaEditVisible = useUiStore((s) => s.areaEditVisible);
  const goalSheetVisible = useUiStore((s) => s.goalSheetVisible);
  const goalDetailOpen = useUiStore((s) => s.goalDetailAreaId !== null);
  const reviewSheetOpen = useUiStore((s) => s.reviewDate !== null);
  const reviewHistoryOpen = useUiStore((s) => s.reviewHistoryVisible);
  if (
    taskSheetVisible ||
    habitSheetVisible ||
    areasSheetVisible ||
    areaEditVisible ||
    goalSheetVisible ||
    goalDetailOpen ||
    reviewSheetOpen ||
    reviewHistoryOpen
  )
    return null;
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: currentTheme.colors.accent }]}
      onPress={onPress ?? (() => openTaskSheet())}
      activeOpacity={0.8}
    >
      <SvgIcon name="plus" size={ICON_SIZES.svg.xl} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 19,
    bottom: 84,
    width: 58,
    height: 58,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2f7cf6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 26,
    elevation: 8,
  },
});
