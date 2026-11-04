/**
 * Настройки (design/luna/L-Settings): тема, характер (тон, цитаты, звания), дни.
 * Всё хранится в настройках в данных и синхронизируется. Язык, итог дня, места и бэкап
 * появятся вместе со своими экранами.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { settingsOf } from '../../core/settings';
import { useDataStore } from '../../core/store';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { THEME_MODES, type Scheme } from '../../theme/palette';
import { SPACE } from '../../theme/metrics';
import { TYPE } from '../../theme/type';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { SettingRow } from '../../ui/SettingRow';
import { ThemeTile } from '../../ui/ThemeTile';

const PREVIEW: Record<(typeof THEME_MODES)[number], Scheme[]> = {
  dark: ['dark'],
  light: ['light'],
  system: ['dark', 'light'],
};

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const s = settingsOf(useDataStore((st) => st.data));

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.xs }]}
    >
      <ScreenHeader title={t('settings.title')} onBack={onBack} />

      <View style={styles.group}>
        <Text style={[TYPE.label, { color: p.muted }]}>{t('settings.theme')}</Text>
        <View
          style={styles.tiles}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('settings.theme')}
        >
          {THEME_MODES.map((m) => (
            <ThemeTile
              key={m}
              label={t(`theme.${m}`)}
              schemes={PREVIEW[m]}
              selected={s.theme === m}
              onPress={() => A.updateSettings({ theme: m })}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle title={t('settings.character')} />
        <SettingRow
          label={t('settings.tone')}
          hint={t('settings.toneHint')}
          value={s.tone === 'bro'}
          onChange={(on) => A.updateSettings({ tone: on ? 'bro' : 'plain' })}
        />
        <SettingRow
          label={t('settings.quotes')}
          hint={t('settings.quotesHint')}
          value={s.quotes}
          onChange={(quotes) => A.updateSettings({ quotes })}
        />
        <SettingRow
          label={t('settings.ranks')}
          value={s.ranks}
          onChange={(ranks) => A.updateSettings({ ranks })}
        />
      </View>

      <View>
        <SectionTitle title={t('settings.days')} />
        <SettingRow
          label={t('settings.weekStart')}
          value={t(s.weekStart === 1 ? 'week.from.1' : 'week.from.0')}
          onPress={() => A.updateSettings({ weekStart: s.weekStart === 1 ? 0 : 1 })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
  group: { gap: SPACE.sm },
  tiles: { flexDirection: 'row', gap: SPACE.tight },
});
