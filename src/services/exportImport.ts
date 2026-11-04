/**
 * Экспорт и импорт бэкапа. Экспорт — формат v5; импорт понимает v5 и старый v4 («CoolTick»).
 * Разбор и проверка данных — в `core/migrate`.
 */
import { parseBackup, toExportV5, type ParsedBackup } from '../core/migrate';
import { now, useDataStore } from '../core/store';
import { todayStr } from '../utils/dates';

type Theme = 'light' | 'dark';

function backupJson(theme: Theme): string {
  return JSON.stringify(toExportV5(useDataStore.getState().data, theme), null, 2);
}

export async function exportData(theme: Theme): Promise<void> {
  const Sharing = await import('expo-sharing');
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, `openstreak-backup-${todayStr()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(backupJson(theme));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Сохранить бэкап',
    UTI: 'public.json',
  });
}

export async function copyToClipboard(theme: Theme): Promise<void> {
  const Clipboard = await import('expo-clipboard');
  await Clipboard.setStringAsync(backupJson(theme));
}

/** Выбрать файл и разобрать его. null — пользователь отменил выбор. */
export async function importData(): Promise<ParsedBackup | null> {
  const DocumentPicker = await import('expo-document-picker');
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const { File } = await import('expo-file-system');
  const text = await new File(result.assets[0].uri).text();
  return parseBackup(text, now(), todayStr());
}
