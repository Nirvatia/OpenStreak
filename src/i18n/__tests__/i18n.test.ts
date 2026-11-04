import { describe, expect, test } from '@jest/globals';
import { pluralCategory, translate } from '..';
import { ru } from '../ru';

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

describe('translate', () => {
  test('plain string is the same in both tones', () => {
    expect(translate('ru', 'plain', 'tab.today')).toBe('Сегодня');
    expect(translate('ru', 'bro', 'tab.today')).toBe('Сегодня');
  });

  test('tone picks its own variant', () => {
    expect(translate('ru', 'plain', 'mark.slip')).toBe('срыв');
    expect(translate('ru', 'bro', 'mark.slip')).toBe('слив');
  });

  test('plural forms with count substitution', () => {
    expect(translate('ru', 'bro', 'unit.days', { count: 1 })).toBe('1 день');
    expect(translate('ru', 'bro', 'unit.days', { count: 3 })).toBe('3 дня');
    expect(translate('ru', 'bro', 'unit.days', { count: 47 })).toBe('47 дней');
  });

  test('unknown placeholders are left as is', () => {
    expect(translate('ru', 'bro', 'unit.days', { count: 2, other: 'x' })).toBe('2 дня');
  });

  test('every toned message has both tones, every plural has one/few/many', () => {
    for (const [key, msg] of Object.entries(ru)) {
      const variants =
        typeof msg === 'object' && 'plain' in msg ? [msg.plain, msg.bro] : [msg as unknown];
      for (const v of variants) {
        if (typeof v === 'string') {
          expect([key, v.length > 0]).toEqual([key, true]);
        } else {
          expect([key, Object.keys(v as object).sort()]).toEqual([
            key,
            ['few', 'many', 'one', 'other'],
          ]);
        }
      }
    }
  });
});
