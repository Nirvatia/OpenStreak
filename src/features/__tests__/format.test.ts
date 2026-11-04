import { describe, expect, test } from '@jest/globals';
import { quoteCount, translate, type MessageKey, type Params } from '../../i18n';
import { dayMonth, fullDate, groupDigits, shortDate } from '../format';

const t = (key: MessageKey, params?: Params) => translate('ru', 'bro', key, params);

describe('форматирование', () => {
  test('даты', () => {
    expect(fullDate(t, '2026-11-04')).toBe('Среда, 4 ноября');
    expect(dayMonth(t, '2026-12-20')).toBe('20 декабря');
    expect(shortDate('2026-11-01')).toBe('01.11.26');
  });
  test('разряды через неразрывный пробел', () => {
    expect(groupDigits(760)).toBe('760');
    expect(groupDigits(1240)).toBe('1 240');
    expect(groupDigits(1234567)).toBe('1 234 567');
  });
  test('строки стаи: очки и сливы по числу и тону', () => {
    expect(t('pack.points', { count: 1240, value: groupDigits(1240) })).toBe('1 240 очков');
    expect(t('pack.slips', { count: 2 })).toBe('слива за неделю');
    expect(translate('ru', 'plain', 'pack.slips', { count: 1 })).toBe('срыв за неделю');
    expect(t('goals.daysLeft', { count: 47 })).toBe('дней осталось');
  });
});

describe('цитаты волка', () => {
  test('29 утверждённых, без пустых и повторов; одинаковые в обоих тонах', () => {
    const n = quoteCount('ru');
    expect(n).toBe(29);
    const all = Array.from({ length: n }, (_, i) => t(`quote.${i}` as MessageKey));
    expect(new Set(all).size).toBe(n);
    expect(all.every((q) => q.trim().length > 0)).toBe(true);
    expect(translate('ru', 'plain', 'quote.0')).toBe(all[0]);
  });
});
