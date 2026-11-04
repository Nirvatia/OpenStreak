/**
 * Настройки интерфейса, кроме темы: тон и язык. Пока хранятся на устройстве;
 * на этапе 3 переезжают в профиль и синхронизируются.
 */
import { create } from 'zustand';
import { translate, type Locale, type MessageKey, type Params, type Tone } from '../i18n';
import { storage, TONE_KEY } from '../services/storage';

type PrefsStore = {
  locale: Locale;
  tone: Tone;
  setTone: (tone: Tone) => Promise<void>;
  loadPrefs: () => Promise<void>;
};

const isTone = (v: unknown): v is Tone => v === 'plain' || v === 'bro';

export const usePrefsStore = create<PrefsStore>((set) => ({
  locale: 'ru',
  // Пацанский тон — фирменный, включён по умолчанию (как в макете настроек).
  tone: 'bro',
  setTone: async (tone) => {
    set({ tone });
    await storage.setString(TONE_KEY, tone);
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
