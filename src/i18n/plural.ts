import type { Forms, Locale } from './types';

type Category = keyof Forms;

/** Категория множественного числа по правилам CLDR (без Intl.PluralRules — его нет в Hermes). */
export function pluralCategory(locale: Locale, n: number): Category {
  if (!Number.isInteger(n)) return 'other';
  const abs = Math.abs(n);
  switch (locale) {
    case 'ru': {
      const m10 = abs % 10;
      const m100 = abs % 100;
      if (m10 === 1 && m100 !== 11) return 'one';
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
      return 'many';
    }
  }
}

export function pickForm(locale: Locale, forms: Forms, n: number): string {
  const cat = pluralCategory(locale, n);
  return forms[cat] ?? forms.other;
}
