/** Тон текста: обычный или «пацанский». */
export type Tone = 'plain' | 'bro';
export type Locale = 'ru' | 'en' | 'es';

/**
 * Формы множественного числа. ru: one — 1, 21; few — 2–4, 22–24; many — 0, 5–20, 25…; other — дроби.
 * en и es: one — ровно 1, other — всё остальное.
 */
export type Forms = { one: string; few?: string; many?: string; other: string };
export type Variant = string | Forms;
/** Строка одинаковая в обоих тонах — или своя для каждого. */
export type Message = Variant | { plain: Variant; bro: Variant };
