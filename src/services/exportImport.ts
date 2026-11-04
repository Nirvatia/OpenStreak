/**
 * Экспорт и импорт бэкапа. Экспорт — формат v5; импорт понимает v5 и старый v4 («CoolTick»).
 * Разбор и проверка данных — в `core/migrate`.
 */
import { Platform } from 'react-native';
import { parseBackup, toExportV5, type ParsedBackup } from '../core/migrate';
import { now, useDataStore } from '../core/store';
import { todayStr } from '../core/dates';

type Theme = 'light' | 'dark';

function backupJson(theme: Theme): string {
  return JSON.stringify(toExportV5(useDataStore.getState().data, theme), null, 2);
}

/** В браузере — обычное скачивание файла. */
function downloadOnWeb(name: string, json: string): void {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportData(theme: Theme): Promise<void> {
  const name = `openstreak-backup-${todayStr()}.json`;
  if (Platform.OS === 'web') {
    downloadOnWeb(name, backupJson(theme));
    return;
  }
  const Sharing = await import('expo-sharing');
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, name);
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

/** В браузере: своё поле выбора файла — открывается сразу по нажатию, без ожиданий до него. */
function pickTextOnWeb(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, reject);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Выбрать файл и разобрать его. null — пользователь отменил выбор. */
export async function importData(): Promise<ParsedBackup | null> {
  if (Platform.OS === 'web') {
    const text = await pickTextOnWeb();
    return text === null ? null : parseBackup(text, now(), todayStr());
  }
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
