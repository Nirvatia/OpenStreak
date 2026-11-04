/** Настройки по умолчанию и чтение настроек из снимка. */
import { SETTINGS_ID, type Settings, type Snapshot } from './model';

export type SettingsFields = Omit<Settings, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

/** Как в макете настроек: тема как в системе, пацанский тон, цитаты и звания включены. */
export const DEFAULT_SETTINGS: SettingsFields = {
  theme: 'system',
  tone: 'bro',
  quotes: true,
  ranks: true,
  locale: 'ru',
  weekStart: 1,
  reviewAt: '21:30',
};

/** Действующие настройки: сохранённые поверх значений по умолчанию. */
export function settingsOf(snap: Pick<Snapshot, 'settings'>): SettingsFields {
  const s = snap.settings[SETTINGS_ID];
  if (!s || s.deletedAt !== null) return { ...DEFAULT_SETTINGS };
  const { id: _id, createdAt: _c, updatedAt: _u, deletedAt: _d, ...fields } = s;
  return { ...DEFAULT_SETTINGS, ...fields };
}
