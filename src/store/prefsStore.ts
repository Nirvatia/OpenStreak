/**
 * Тон и язык для строк интерфейса. Источник правды — настройки в данных (`core/settings`),
 * здесь — их копия для `useT()`; на устройстве — копия тона для экранов до загрузки данных.
 */
import { create } from 'zustand';
import { updateSettings } from '../core/actions';
import { useDataStore } from '../core/store';
import { translate, type Locale, type MessageKey, type Params, type Tone } from '../i18n';
import { storage, TONE_KEY } from '../services/storage';

type PrefsStore = {
  locale: Locale;
  tone: Tone;
  setTone: (tone: Tone) => Promise<void>;
  /** Применить тон и язык из настроек (без записи обратно). */
  apply: (p: { tone: Tone; locale: Locale }) => void;
  loadPrefs: () => Promise<void>;
};

const isTone = (v: unknown): v is Tone => v === 'plain' || v === 'bro';

export const usePrefsStore = create<PrefsStore>((set) => ({
  locale: 'ru',
  // Пацанский тон — фирменный, включён по умолчанию (как в макете настроек).
  tone: 'bro',
  setTone: async (tone) => {
    set({ tone });
    if (useDataStore.getState().ready) updateSettings({ tone });
    await storage.setString(TONE_KEY, tone);
  },
  apply: ({ tone, locale }) => {
    set({ tone, locale });
    void storage.setString(TONE_KEY, tone);
  },
  loadPrefs: async () => {
    const saved = await storage.getString(TONE_KEY);
    if (isTone(saved)) set({ tone: saved });
  },
}));

export type Translate = (key: MessageKey, params?: Params) => string;

/** Функция перевода для текущих языка и тона; компонент перерисуется при их смене. */
export function useT(): Translate {
  const locale = usePrefsStore((s) => s.locale);
  const tone = usePrefsStore((s) => s.tone);
  return (key, params) => translate(locale, tone, key, params);
}
