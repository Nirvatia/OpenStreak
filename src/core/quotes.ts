/**
 * Цитата волка на день. Тексты — в строках (`src/i18n`), здесь только выбор: одна на день,
 * одинаковая весь день, без повторов подряд; только в пацанском тоне и если цитаты включены.
 */
import { diffDays } from './dates';
import type { ISODate } from './model';
import type { SettingsFields } from './settings';

/** Номер цитаты дня из `count` или null, если цитату показывать не нужно. */
export function quoteOfDay(
  settings: Pick<SettingsFields, 'tone' | 'quotes'>,
  date: ISODate,
  count: number
): number | null {
  if (!settings.quotes || settings.tone !== 'bro' || count <= 0) return null;
  const day = diffDays('2000-01-01', date);
  // Шаг, взаимно простой с count, обходит все цитаты по кругу в «перемешанном» порядке.
  const step = coprimeStep(count);
  return (((day * step) % count) + count) % count;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function coprimeStep(n: number): number {
  for (let s = Math.floor(n * 0.618) || 1; s < n + 1; s++) if (gcd(s, n) === 1) return s;
  return 1;
}
