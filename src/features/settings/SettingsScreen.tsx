/**
 * Настройки (design/mult/M-Settings): тема, характер (тон, цитаты, звания), дни.
 * Всё хранится в настройках в данных и синхронизируется. Итог дня — время и напоминание;
 * язык — русский, английский, испанский; места; данные — бэкап в файл и восстановление.
 */
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as A from '../../core/actions';
import { live } from '../../core/model';
import { settingsOf } from '../../core/settings';
import { replaceAll, useDataStore } from '../../core/store';
import { exportData, importData } from '../../services/exportImport';
import { askNotificationPermission } from '../../services/notifications';
import { LOCALES, type MessageKey } from '../../i18n';
import { useT } from '../../store/prefsStore';
import { usePalette, useThemeStore } from '../../store/themeStore';
import { THEME_MODES, type Scheme, type ThemeMode } from '../../theme/palette';
import { SPACE, TILT } from '../../theme/metrics';
import { ScreenHeader, SectionTitle } from '../../ui/ScreenHeader';
import { SettingRow } from '../../ui/SettingRow';
import { Card } from '../../ui/Sticker';
import { ThemeTile } from '../../ui/ThemeTile';
import { UNDO_MS, useToast } from '../../ui/toast';

/** Системный выбор времени есть только на телефонах. */
const HAS_PICKER = Platform.OS !== 'web';
/** Время итога, которое ставим при включении напоминания. */
const DEFAULT_REVIEW_AT = '21:30';

const clock = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Порядок плиток как в макете: День, Вечер, как в системе. */
const ORDER: ThemeMode[] = ['light', 'dark', 'system'];

const PREVIEW: Record<(typeof THEME_MODES)[number], Scheme[]> = {
  dark: ['dark'],
  light: ['light'],
  system: ['dark', 'light'],
};

export function SettingsScreen({
  onBack,
  onOpenPlaces,
}: {
  onBack: () => void;
  onOpenPlaces: () => void;
}) {
  const p = usePalette();
  const t = useT();
  const insets = useSafeAreaInsets();
  const data = useDataStore((st) => st.data);
  const s = settingsOf(data);
  const placeCount = live(data.places).length;
  const scheme = useThemeStore((st) => st.scheme);
  const toast = useToast((st) => st.show);
  const [picker, setPicker] = useState(false);
  const [importArmed, setImportArmed] = useState(false);

  const toggleReview = async (on: boolean) => {
    A.updateSettings({ reviewAt: on ? DEFAULT_REVIEW_AT : '' });
    if (on) await askNotificationPermission();
  };

  const exportBackup = async () => {
    try {
      await exportData(scheme);
    } catch {
      toast(t('toast.exportFailed'));
    }
  };

  // Импорт заменяет всё — первое нажатие только предупреждает.
  const importBackup = async () => {
    const hasData = Object.values(data.tasks).length + Object.values(data.habits).length > 0;
    if (hasData && !importArmed) {
      setImportArmed(true);
      toast(t('toast.importConfirm'));
      setTimeout(() => setImportArmed(false), UNDO_MS);
      return;
    }
    setImportArmed(false);
    try {
      const result = await importData();
      if (!result) return;
      await replaceAll(result.snapshot);
      // Старый формат хранил тему отдельно от данных.
      if (result.format === 4 && result.theme) A.updateSettings({ theme: result.theme });
      toast(t('toast.imported'));
    } catch {
      toast(t('toast.importFailed'));
    }
  };

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
            label={t('settings.language')}
            value={t(`lang.${s.locale}` as MessageKey)}
            onPress={() =>
              A.updateSettings({
                locale: LOCALES[(LOCALES.indexOf(s.locale) + 1) % LOCALES.length],
              })
            }
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
          />
          <SettingRow
            label={t('settings.reviewRemind')}
            hint={t('settings.reviewRemindHint')}
            value={!!s.reviewAt}
            onChange={toggleReview}
            last={!s.reviewAt}
          />
          {!!s.reviewAt && (
            <SettingRow
              label={t('settings.reviewAt')}
              value={s.reviewAt}
              onPress={() => HAS_PICKER && setPicker(true)}
              last
            />
          )}
        </Card>
      </View>

      <View style={styles.group}>
        <Card padded={false}>
          <SettingRow
            label={t('settings.places')}
            hint={t('settings.placesHint')}
            value={String(placeCount)}
            onPress={onOpenPlaces}
            last
          />
        </Card>
      </View>

      <View style={styles.group}>
        <SectionTitle title={t('settings.data')} tilt={1} />
        <Card padded={false}>
          <SettingRow
            label={t('settings.export')}
            hint={t('settings.exportHint')}
            value={t('settings.exportValue')}
            onPress={exportBackup}
          />
          <SettingRow
            label={t('settings.import')}
            hint={t('settings.importHint')}
            value={t('settings.importValue')}
            onPress={importBackup}
            last
          />
        </Card>
      </View>

      {picker && (
        <DateTimePicker
          mode="time"
          value={new Date(`2000-01-01T${s.reviewAt || DEFAULT_REVIEW_AT}:00`)}
          onChange={(e: DateTimePickerEvent, value?: Date) => {
            setPicker(false);
            if (e.type === 'set' && value) A.updateSettings({ reviewAt: clock(value) });
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.screenX, paddingBottom: SPACE.xl, gap: SPACE.lg },
  group: { gap: SPACE.md },
  tiles: { flexDirection: 'row', gap: 10 },
});
