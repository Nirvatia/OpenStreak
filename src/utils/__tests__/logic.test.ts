import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Habit } from '../../types/models';
import { isScheduled, isRest, scheduleLabel, streak, unitLabel } from '../habits';
import { isPerfect } from '../moods';
import { activityPerDay, perfectStreak } from '../stats';
import { addDays, rel, monthTitle, todayStr } from '../dates';
import { plural } from '../text';
import { daysToGoal } from '../goals';
import { useCalendarStore } from '../../store/calendarStore';

// «Сегодня» во всех тестах — вторник, 4 ноября 2026.
const TODAY = '2026-11-04';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(`${TODAY}T12:00:00`));
});

afterEach(() => {
  jest.useRealTimers();
});

function habit(over: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Отжимания',
    type: 'good',
    emoji: 'dumbbell',
    color: '#000000',
    days: null,
    dates: [],
    question: '',
    remind: '',
    area: null,
    createdAt: '2026-10-01',
    rest: [],
    progress: {},
    measureType: 'boolean',
    unit: 'count',
    target: 1,
    ...over,
  };
}

/** Дни подряд, заканчивая `end` включительно. */
function daysBack(end: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(end, -i));
}

describe('даты', () => {
  test('todayStr использует локальную дату', () => {
    expect(todayStr()).toBe(TODAY);
  });

  test('addDays переходит через границу месяца и года', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  test('rel: сегодня / завтра / вчера / день недели / дата', () => {
    expect(rel(TODAY)).toBe('Сегодня');
    expect(rel('2026-11-05')).toBe('Завтра');
    expect(rel('2026-11-03')).toBe('Вчера');
    expect(rel('2026-11-07')).toBe('суббота');
    expect(rel('2026-11-20')).toBe('20 ноября');
  });

  test('monthTitle', () => {
    expect(monthTitle(2026, 10)).toBe('Ноябрь 2026');
  });

  test('plural для русского', () => {
    const p = (n: number) => plural(n, 'день', 'дня', 'дней');
    expect([1, 2, 5, 11, 12, 21, 22, 25, 111].map(p)).toEqual([
      'день',
      'дня',
      'дней',
      'дней',
      'дней',
      'день',
      'дня',
      'дней',
      'дней',
    ]);
  });

  test('daysToGoal', () => {
    expect(daysToGoal('2026-12-21')).toBe(47);
    expect(daysToGoal('2026-11-01')).toBe(-3);
  });
});

describe('расписание привычки', () => {
  test('без дней — каждый день', () => {
    expect(isScheduled(habit(), TODAY)).toBe(true);
    expect(scheduleLabel(habit())).toBe('каждый день');
  });

  test('по будням', () => {
    const h = habit({ days: [1, 2, 3, 4, 5] });
    expect(isScheduled(h, TODAY)).toBe(true); // вторник
    expect(isScheduled(h, '2026-11-08')).toBe(false); // воскресенье
    expect(scheduleLabel(h)).toBe('пн, вт, ср, чт, пт');
  });

  test('период отдыха включает обе границы', () => {
    const h = habit({ rest: [{ f: '2026-11-01', t: '2026-11-03' }] });
    expect(isRest(h, '2026-11-01')).toBe(true);
    expect(isRest(h, '2026-11-03')).toBe(true);
    expect(isRest(h, TODAY)).toBe(false);
  });

  test('unitLabel', () => {
    expect(unitLabel('minutes')).toBe('мин');
    expect(unitLabel('hours')).toBe('ч');
    expect(unitLabel('count')).toBe('раз');
  });
});

describe('серии', () => {
  test('полезная: считает подряд, включая сегодня', () => {
    expect(streak(habit({ dates: daysBack(TODAY, 14) }))).toBe(14);
  });

  test('полезная: сегодня ещё не отмечено — серия не сгорает', () => {
    expect(streak(habit({ dates: daysBack('2026-11-03', 5) }))).toBe(5);
  });

  test('полезная: пропуск обрывает серию', () => {
    const dates = [...daysBack(TODAY, 3), ...daysBack('2026-10-30', 10)];
    expect(streak(habit({ dates }))).toBe(3);
  });

  test('полезная: отдых не обрывает серию', () => {
    const dates = [TODAY, '2026-11-03', '2026-10-31', '2026-10-30'];
    const h = habit({ dates, rest: [{ f: '2026-11-01', t: '2026-11-02' }] });
    expect(streak(h)).toBe(4);
  });

  test('полезная: дни вне расписания пропускаются', () => {
    // По будням; выходные 31.10–01.11 не в плане.
    const dates = [TODAY, '2026-11-03', '2026-11-02', '2026-10-30'];
    expect(streak(habit({ days: [1, 2, 3, 4, 5], dates }))).toBe(4);
  });

  test('вредная: считаем чистые дни с момента создания', () => {
    expect(streak(habit({ type: 'bad', createdAt: '2026-10-12' }))).toBe(24);
  });

  test('вредная: срыв сегодня — ноль', () => {
    expect(streak(habit({ type: 'bad', dates: [TODAY] }))).toBe(0);
  });

  test('вредная: срыв 3 дня назад', () => {
    expect(streak(habit({ type: 'bad', dates: ['2026-11-01'] }))).toBe(3);
  });
});

describe('идеальный день', () => {
  test('все привычки по плану закрыты', () => {
    const habits = [habit({ id: 'a', dates: [TODAY] }), habit({ id: 'b', type: 'bad' })];
    expect(isPerfect(TODAY, habits, '2026-10-01')).toBe(true);
  });

  test('срыв вредной — не идеальный', () => {
    const habits = [
      habit({ id: 'a', dates: [TODAY] }),
      habit({ id: 'b', type: 'bad', dates: [TODAY] }),
    ];
    expect(isPerfect(TODAY, habits, '2026-10-01')).toBe(false);
  });

  test('будущее и дни до начала — не идеальные', () => {
    const habits = [habit({ dates: ['2026-11-05', '2026-09-01'] })];
    expect(isPerfect('2026-11-05', habits, '2026-10-01')).toBe(false);
    expect(isPerfect('2026-09-01', habits, '2026-10-01')).toBe(false);
  });

  test('нет привычек — не идеальный', () => {
    expect(isPerfect(TODAY, [], '2026-10-01')).toBe(false);
  });

  test('perfectStreak', () => {
    const habits = [habit({ dates: daysBack(TODAY, 6), createdAt: '2026-10-29' })];
    expect(perfectStreak(habits, '2026-10-29')).toBe(6);
  });
});

describe('статистика', () => {
  test('activityPerDay складывает отметки привычек и закрытые задачи', () => {
    const habits = [habit({ dates: [TODAY] })];
    const tasks = [
      {
        id: 't',
        title: 'x',
        date: TODAY,
        priority: 0 as const,
        notes: '',
        done: true,
        doneAt: TODAY,
        createdAt: 0,
        area: null,
        remind: '',
      },
    ];
    expect(activityPerDay(TODAY, tasks, habits)).toBe(2);
  });

  test('срыв вредной привычки не считается активностью', () => {
    const habits = [habit({ type: 'bad', dates: [TODAY] })];
    expect(activityPerDay(TODAY, [], habits)).toBe(0);
  });
});

describe('календарь', () => {
  test('перелистывание месяца с 31-го числа', () => {
    useCalendarStore.setState({ calView: 'month', calCursor: '2027-01-31' });
    useCalendarStore.getState().navigateNext();
    expect(useCalendarStore.getState().calCursor).toBe('2027-02-28');
    useCalendarStore.getState().navigatePrev();
    expect(useCalendarStore.getState().calCursor).toBe('2027-01-28');
  });

  test('перелистывание года с 29 февраля', () => {
    useCalendarStore.setState({ calView: 'year', calCursor: '2028-02-29' });
    useCalendarStore.getState().navigateNext();
    expect(useCalendarStore.getState().calCursor).toBe('2029-02-28');
  });
});
