import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { AppIcon } from './icons/AppIcon';
import { quoteOfDay } from '../utils/quotes';
import { todayStr } from '../utils/text';
import { FONT } from '../theme/fonts';

export const QuoteCard: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const quote = quoteOfDay(todayStr());

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.iconWrap}>
        <AppIcon name="bulb" sizeClass="md" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.text, { color: currentTheme.colors.text }]}>
          <Text style={{ color: currentTheme.colors.accent }}>«</Text>
          {quote.text}
          <Text style={{ color: currentTheme.colors.accent }}>»</Text>
        </Text>
        <Text style={[styles.author, { color: currentTheme.colors.muted }]}>— {quote.author}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  iconWrap: { marginTop: 2 },
  content: { flex: 1 },
  text: { fontFamily: FONT.golos.medium, fontSize: 14, lineHeight: 20 },
  author: { fontFamily: FONT.golos.semibold, fontSize: 12, marginTop: 4 },
});
