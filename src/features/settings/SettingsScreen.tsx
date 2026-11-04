/**
 * Настройки (design/mult/M-Settings): тема, характер (тон, цитаты, звания), дни.
 * Всё хранится в настройках в данных и синхронизируется. Язык, итог дня, места и бэкап
 * появятся вместе со своими экранами.
 */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { settingsOf } from '../../core/settings';
import { useDataStore } from '../../core/store';
import { useT } from '../../store/prefsStore';
import { usePalette } from '../../store/themeStore';
import { THEME_MODES, type Scheme, type ThemeMode } from '../../theme/palette';
import { SPACE, TILT } from '../../theme/metrics';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { SettingRow } from '../../ui/SettingRow';
import { Card } from '../../ui/Sticker';
import { ThemeTile } from '../../ui/ThemeTile';

/** Порядок плиток как в макете: День, Вечер, как в системе. */
const ORDER: ThemeMode[] = ['light', 'dark', 'system'];

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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACE.md }]}
    >
      <ScreenHeader title={t('settings.title')} onBack={onBack} />

      <View style={styles.group}>
        <SectionTitle title={t('settings.theme')} tone="sun" tilt={TILT.slightLeft} />
        <View
          style={styles.tiles}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('settings.theme')}
        >
          {ORDER.map((m, i) => (
            <ThemeTile
              key={m}
              lean={i % 2 ? 2 : -2}
              label={t(`theme.${m}`)}
              schemes={PREVIEW[m]}
              selected={s.theme === m}
              onPress={() => A.updateSettings({ theme: m })}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <SectionTitle title={t('settings.character')} tilt={TILT.slightRight} />
        <Card padded={false}>
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
            last
          />
        </Card>
      </View>

      <View style={styles.group}>
        <SectionTitle title={t('settings.days')} tilt={-1.5} />
        <Card padded={false}>
          <SettingRow
            label={t('settings.weekStart')}
            value={t(s.weekStart === 1 ? 'week.from.1' : 'week.from.0')}
            onPress={() => A.updateSettings({ weekStart: s.weekStart === 1 ? 0 : 1 })}
            last
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
  group: { gap: SPACE.md },
  tiles: { flexDirection: 'row', gap: 10 },
});
