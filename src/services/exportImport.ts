import { AppState } from '../types/models';
import { todayStr } from '../utils/text';

type AnyFs = any;
type FsBundle = { kind: 'legacy' | 'new'; mod: AnyFs };

async function loadFs(): Promise<FsBundle> {
  try {
    const legacy = await import('expo-file-system/legacy');
    if (legacy.documentDirectory && typeof legacy.writeAsStringAsync === 'function') {
      return { kind: 'legacy', mod: legacy };
    }
  } catch {
    // легаси нет — пробуем новый API
  }
  const modern = await import('expo-file-system');
  return { kind: 'new', mod: modern };
}

async function writeText(fs: FsBundle, fileUri: string, text: string): Promise<void> {
  if (fs.kind === 'legacy') {
    await fs.mod.writeAsStringAsync(fileUri, text, { encoding: fs.mod.EncodingType.UTF8 });
    return;
  }
  const name = fileUri.split('/').pop() || 'backup.json';
  const file = new fs.mod.File(fs.mod.Paths.document, name);
  await file.write(text);
}

async function readText(fs: FsBundle, uri: string): Promise<string> {
  if (fs.kind === 'legacy') {
    return await fs.mod.readAsStringAsync(uri, { encoding: fs.mod.EncodingType.UTF8 });
  }
  const file = new fs.mod.File(uri);
  return await file.text();
}

function buildPayload(state: AppState, theme: 'light' | 'dark') {
  return {
    app: 'CoolTick',
    version: 4,
    exportedAt: new Date().toISOString(),
    theme: theme,
    state: {
      tasks: state.tasks.map((x) => ({ ...x })),
      habits: state.habits.map((h) => ({
        ...h,
        rest: h.rest.map((r) => ({ ...r })),
      })),
      areas: state.areas.map((a) => ({
        ...a,
        goals: a.goals.map((g) => ({ ...g })),
      })),
      moods: JSON.parse(JSON.stringify(state.moods)),
      fired: state.fired,
      startedAt: state.startedAt,
    },
  };
}

export async function exportData(state: AppState, theme: 'light' | 'dark'): Promise<void> {
  const Sharing = await import('expo-sharing');
  const fs = await loadFs();
  const json = JSON.stringify(buildPayload(state, theme), null, 2);
  const filename = `cooltick-backup-${todayStr()}.json`;

  let fileUri: string;
  if (fs.kind === 'legacy') {
    const dir = fs.mod.documentDirectory;
    if (!dir) throw new Error('Document directory not available');
    fileUri = `${dir}${filename}`;
    await writeText(fs, fileUri, json);
  } else {
    const file = new fs.mod.File(fs.mod.Paths.document, filename);
    await file.write(json);
    fileUri = file.uri;
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Сохранить бэкап',
    UTI: 'public.json',
  });
}

export async function copyToClipboard(state: AppState, theme: 'light' | 'dark'): Promise<void> {
  const Clipboard = await import('expo-clipboard');
  const json = JSON.stringify(buildPayload(state, theme), null, 2);
  await Clipboard.setStringAsync(json);
}

export async function importData(): Promise<{
  state: AppState;
  theme?: 'light' | 'dark';
} | null> {
  const DocumentPicker = await import('expo-document-picker');
  const fs = await loadFs();

  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets || !result.assets.length) return null;

  const content = await readText(fs, result.assets[0].uri);
  const data = JSON.parse(content);
  const s = data.state || data;

  if (!Array.isArray(s.tasks) || !Array.isArray(s.habits)) {
    throw new Error('Invalid format');
  }

  const startedAt: string = s.startedAt || todayStr();

  const state: AppState = {
    tasks: s.tasks.map((x: any) => ({
      priority: 0,
      notes: '',
      done: false,
      doneAt: null,
      area: null,
      remind: '',
      ...x,
    })),
    habits: s.habits.map((h: any) => {
      const { rest: hRest, ...restH } = h;
      return {
        days: null,
        type: 'good',
        question: '',
        createdAt: startedAt,
        remind: '',
        area: null,
        progress: {},
        measureType: 'boolean',
        unit: 'count',
        target: 1,
        ...restH,
        rest: Array.isArray(hRest) ? hRest.map((r: any) => ({ ...r })) : [],
      };
    }),
    events: [],
    areas: Array.isArray(s.areas)
      ? s.areas.map((a: any) => {
          const { goals: aGoals, ...restA } = a;
          return {
            ...restA,
            goals: Array.isArray(aGoals) ? aGoals.map((g: any) => ({ ...g })) : [],
            icon: a.icon || 'target',
          };
        })
      : [],
    moods: s.moods && typeof s.moods === 'object' ? JSON.parse(JSON.stringify(s.moods)) : {},
    fired: s.fired && typeof s.fired === 'object' ? { ...s.fired } : {},
    startedAt,
  };

  const theme =
    data.theme && (data.theme === 'light' || data.theme === 'dark') ? data.theme : undefined;

  return { state, theme };
}