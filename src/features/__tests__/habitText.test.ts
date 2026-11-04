import { describe, expect, test } from '@jest/globals';
import type { HabitDay } from '../../core/habits';
import type { Habit } from '../../core/model';
import { translate, type MessageKey, type Params } from '../../i18n';
import { dayState, habitMeta, scheduleLabel, streakLabel } from '../habits/habitText';

const t = (key: MessageKey, params?: Params) => translate('ru', 'bro', key, params);

const habit = (over: Partial<Habit> = {}): Habit => ({
  id: 'h',
  createdAt: 1,
  updatedAt: 1,
  deletedAt: null,
  name: 'Отжимания',
  kind: 'good',
  icon: 'dumbbell',
  color: '#000000',
  days: null,
  question: '',
  remindAt: '',
  areaId: null,
  startDate: '2026-10-12',
  measure: 'boolean',
  unit: 'count',
  target: 1,
  placeId: null,
  placeTrigger: null,
  archivedAt: null,
  ...over,
});

describe('подписи привычек', () => {
  test('расписание: каждый день, диапазон, отдельные дни, неделя с воскресенья', () => {
    expect(scheduleLabel(t, null, 1)).toBe('каждый день');
    expect(scheduleLabel(t, [1, 2, 3, 4, 5], 1)).toBe('пн–пт');
    expect(scheduleLabel(t, [1, 3, 5], 1)).toBe('пн, ср, пт');
    expect(scheduleLabel(t, [0, 6], 1)).toBe('сб, вс');
    expect(scheduleLabel(t, [0, 1, 2], 0)).toBe('вс–вт');
  });

  test('подпись под названием: норма и сегодня, вредная — с какого дня', () => {
    expect(habitMeta(t, habit({ measure: 'numeric', target: 100 }), 60, 1)).toBe(
      '100 в день · сегодня 60'
    );
    expect(habitMeta(t, habit({ measure: 'numeric', target: 20, unit: 'minutes' }), 5, 1)).toBe(
      '20 мин в день · сегодня 5'
    );
    expect(habitMeta(t, habit({ kind: 'bad' }), 0, 1)).toBe('вредная · с 12 октября');
  });

  test('бейдж серии: дни, чистые, с нуля', () => {
    expect(streakLabel(t, habit(), 14)).toBe('дней');
    expect(streakLabel(t, habit(), 2)).toBe('дня');
    expect(streakLabel(t, habit({ kind: 'bad' }), 23)).toBe('чистых');
    expect(streakLabel(t, habit(), 0)).toBe('с нуля');
  });

  test('вид дня: чистый у вредной, сегодня без отметки, не по плану — пунктир', () => {
    const day = (mark: HabitDay['mark'], date = '2026-11-03'): HabitDay => ({
      date,
      mark,
      value: 0,
      fraction: 0,
      at: null,
    });
    expect(dayState(day('full'), habit({ kind: 'bad' }), '2026-11-04')).toBe('clean');
    expect(dayState(day('full'), habit(), '2026-11-04')).toBe('done');
    expect(dayState(day('empty', '2026-11-04'), habit(), '2026-11-04')).toBe('today');
    expect(dayState(day('off'), habit(), '2026-11-04')).toBe('rest');
  });
});
