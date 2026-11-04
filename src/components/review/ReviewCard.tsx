import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';
import { MoodFace } from './MoodFace';
import { AppIcon } from '../icons/AppIcon';
import { todayStr } from '../../utils/text';

export const ReviewCard: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const moods = useAppStore((s) => s.state.moods);
  const openReview = useUiStore((s) => s.openReview);
  const openReviewHistory = useUiStore((s) => s.openReviewHistory);
  const showToast = useToastStore((s) => s.show);
  const tb = todayStr();
  const review = moods[tb];

  const handleCardPress = () => openReviewHistory();

  const handleButtonPress = () => {
    if (!openReview(tb)) showToast('Этот день ещё не наступил');
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentTheme.colors.card }]}
      onPress={handleCardPress}
      activeOpacity={0.85}
    >
      {review ? <MoodFace mood={review.mood} size="md" /> : <AppIcon name="star" sizeClass="sm" />}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Вечерний обзор</Text>
        <Text style={[styles.sub, { color: currentTheme.colors.muted }]} numberOfLines={1}>
          {review ? review.note || 'настроение отмечено' : 'итоги дня и пара строк в дневник'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentTheme.colors.accent }]}
        onPress={handleButtonPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>
          {review ? 'Изменить' : 'Заполнить'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 13,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 2 },
  button: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 13, fontWeight: '600' },
});
