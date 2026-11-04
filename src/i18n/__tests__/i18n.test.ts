import { describe, expect, test } from '@jest/globals';
import { LOCALES, pluralCategory, quoteCount, translate, type MessageKey } from '..';
import { en } from '../en';
import { es } from '../es';
import { ru } from '../ru';
import type { Locale, Message } from '../types';

const DICTS: Record<Locale, Record<string, Message>> = { ru, en, es };

describe('pluralCategory ru', () => {
  test.each([
    [0, 'many'],
    [1, 'one'],
    [2, 'few'],
    [4, 'few'],
    [5, 'many'],
    [11, 'many'],
    [12, 'many'],
    [14, 'many'],
    [21, 'one'],
    [22, 'few'],
    [111, 'many'],
    [101, 'one'],
    [-3, 'few'],
    [1.5, 'other'],
  ])('%p → %s', (n, cat) => {
    expect(pluralCategory('ru', n)).toBe(cat);
  });
});

describe('pluralCategory en/es', () => {
  test.each(['en', 'es'] as const)('%s: one only for exactly 1', (locale) => {
    expect(pluralCategory(locale, 1)).toBe('one');
    expect(pluralCategory(locale, -1)).toBe('one');
    expect(pluralCategory(locale, 0)).toBe('other');
    expect(pluralCategory(locale, 2)).toBe('other');
    expect(pluralCategory(locale, 21)).toBe('other');
    expect(pluralCategory(locale, 1.5)).toBe('other');
  });
});

describe('translate', () => {
  test('plain string is the same in both tones', () => {
    expect(translate('ru', 'plain', 'tab.today')).toBe('Сегодня');
    expect(translate('ru', 'bro', 'tab.today')).toBe('Сегодня');
  });

  test('tone picks its own variant', () => {
    expect(translate('ru', 'plain', 'mark.slip')).toBe('срыв');
    expect(translate('ru', 'bro', 'mark.slip')).toBe('слив');
    expect(translate('en', 'bro', 'mark.slip')).toBe('bailed');
    expect(translate('es', 'plain', 'mark.slip')).toBe('fallo');
  });

  test('plural forms with count substitution in every language', () => {
    expect(translate('ru', 'bro', 'pack.with', { count: 1 })).toBe('с тобой 1 день');
    expect(translate('ru', 'bro', 'pack.with', { count: 3 })).toBe('с тобой 3 дня');
    expect(translate('ru', 'bro', 'pack.with', { count: 47 })).toBe('с тобой 47 дней');
    expect(translate('en', 'bro', 'pack.with', { count: 1 })).toBe('with you 1 day');
    expect(translate('en', 'bro', 'pack.with', { count: 47 })).toBe('with you 47 days');
    expect(translate('es', 'bro', 'pack.with', { count: 47 })).toBe('contigo 47 días');
  });

  test('unknown placeholders are left as is', () => {
    expect(translate('ru', 'bro', 'pack.with', { count: 2, other: 'x' })).toBe('с тобой 2 дня');
  });
});

describe('словари', () => {
  const ruKeys = Object.keys(ru).sort();

  test.each(LOCALES)('%s: те же ключи, что в ru', (locale) => {
    expect(Object.keys(DICTS[locale]).sort()).toEqual(ruKeys);
  });

  test.each(LOCALES)('%s: тон — оба варианта, формы — полный набор, строки не пустые', (locale) => {
    const forms = locale === 'ru' ? ['few', 'many', 'one', 'other'] : ['one', 'other'];
    for (const [key, msg] of Object.entries(DICTS[locale])) {
      const variants =
        typeof msg === 'object' && 'plain' in msg ? [msg.plain, msg.bro] : [msg as unknown];
      for (const v of variants) {
        if (typeof v === 'string') {
          expect([key, v.trim().length > 0]).toEqual([key, true]);
        } else {
          expect([key, Object.keys(v as object).sort()]).toEqual([key, forms]);
        }
      }
    }
  });

  test.each(['en', 'es'] as const)('%s: подстановки те же, что в ru', (locale) => {
    const holes = (m: Message) => [...new Set(JSON.stringify(m).match(/\{\w+\}/g) ?? [])].sort();
    for (const key of ruKeys) {
      expect([key, holes(DICTS[locale][key])]).toEqual([key, holes(ru[key as MessageKey])]);
    }
  });

  test('цитат одинаково во всех языках', () => {
    expect(new Set(LOCALES.map((l) => quoteCount(l))).size).toBe(1);
  });
});
