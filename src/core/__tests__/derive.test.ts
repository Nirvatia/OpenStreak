import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as A from '../actions';
import { addDays, daysBetween, diffDays, startOfWeek, weekday } from '../dates';
import { closedStreak, dayNumber, dayView, firstReminder, moodPhase } from '../day';
import { goalCounts, goalViews } from '../goals';
import { habitDay, habitDays, habitStats, indexHabits, dataOf } from '../habits';
import { cleanCheck, cleanSettings, fromExportV5, toExportV5 } from '../migrate';
import {
  checkId,
  emptySnapshot,
  SETTINGS_ID,
  type Goal,
  type Habit,
  type HabitCheck,
  type RecordMeta,
  type Snapshot,
  type Task,
} from '../model';
import { dayPoints, packWeek, POINTS, rankOf, totalPoints } from '../points';
import { quoteOfDay } from '../quotes';
import { DEFAULT_SETTINGS, settingsOf } from '../settings';
import { MemoryStorage } from '../storage/memory';
import { initData, resetForTests, setClock, useDataStore } from '../store';
import { taskCounts, taskGroups } from '../tasks';

// 2026-11-04 — среда.
const TODAY = '2026-11-04';
const NOW = new Date(`${TODAY}T12:00:00`).getTime();

const meta = (id: string, createdAt = 1): RecordMeta => ({
  id,
  createdAt,
  updatedAt: createdAt,
  deletedAt: null,
});

function task(id: string, over: Partial<Task> = {}): Task {
  return {
    ...meta(id),
    title: id,
    notes: '',
    date: TODAY,
    priority: 0,
    doneOn: null,
    doneAt: null,
    areaId: null,
    remindAt: '',
    placeId: null,
    placeTrigger: null,
    ...over,
  };
}

function habit(id: string, over: Partial<Habit> = {}): Habit {
  return {
    ...meta(id),
    name: id,
    kind: 'good',
    icon: 'target',
    color: '#000000',
    days: null,
    question: '',
    remindAt: '',
    areaId: null,
    startDate: '2026-10-01',
    measure: 'boolean',
    unit: 'count',
    target: 1,
    placeId: null,
    placeTrigger: null,
    archivedAt: null,
    ...over,
  };
}

function check(habitId: string, date: string, value = 1, slip = false): HabitCheck {
  return { ...meta(checkId(habitId, date), 5), habitId, date, value, ...(slip ? { slip } : {}) };
}

function goal(id: string, over: Partial<Goal> = {}): Goal {
  return {
    ...meta(id),
    areaId: 'a',
    text: id,
    criterion: '',
    reward: '',
    penalty: '',
    deadline: null,
    doneOn: null,
    ...over,
  };
}

function snap(parts: {
  tasks?: Task[];
  habits?: Habit[];
  checks?: HabitCheck[];
  goals?: Goal[];
  reviews?: string[];
  rests?: [string, string, string][];
}): Snapshot {
  const s = emptySnapshot('2026-10-01');
  for (const t of parts.tasks ?? []) s.tasks[t.id] = t;
  for (const h of parts.habits ?? []) s.habits[h.id] = h;
  for (const c of parts.checks ?? []) s.checks[c.id] = c;
  for (const g of parts.goals ?? []) s.goals[g.id] = g;
  for (const d of parts.reviews ?? []) s.reviews[d] = { ...meta(d), date: d, mood: 3, note: '' };
  (parts.rests ?? []).forEach(([habitId, from, to], i) => {
    s.rests[`r${i}`] = { ...meta(`r${i}`), habitId, from, to };
  });
  return s;
}

/** Ежедневная отметка привычки за дни [from, to]. */
const daily = (habitId: string, from: string, to: string) =>
  daysBetween(from, to).map((d) => check(habitId, d));

describe('даты', () => {
  test('арифметика без часовых поясов и переход через месяц и год', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30'); // смена на летнее время в Европе
    expect(diffDays('2026-10-01', TODAY)).toBe(34);
    expect(weekday(TODAY)).toBe(3);
  });

  test('начало недели с понедельника и с воскресенья', () => {
    expect(startOfWeek(TODAY, 1)).toBe('2026-11-02');
    expect(startOfWeek(TODAY, 0)).toBe('2026-11-01');
    expect(startOfWeek('2026-11-01', 1)).toBe('2026-10-26'); // воскресенье
  });
});

describe('привычки', () => {
  test('состояние дня полезной: норма, недобор, слил, выходной, пусто, не по плану', () => {
    const h = habit('push', { measure: 'numeric', target: 100, days: [1, 2, 3, 4, 5] });
    const s = snap({
      habits: [h],
      checks: [
        check('push', '2026-11-02', 100),
        check('push', TODAY, 60),
        check('push', '2026-10-30', 0, true),
      ],
      rests: [['push', '2026-10-29', '2026-10-29']],
    });
    const data = dataOf(indexHabits(s), 'push');
    const mark = (d: string) => habitDay(h, data, d, TODAY).mark;
    expect(mark('2026-11-02')).toBe('full');
    expect(habitDay(h, data, TODAY, TODAY)).toMatchObject({ mark: 'partial', fraction: 0.6 });
    expect(mark('2026-10-30')).toBe('slip');
    expect(mark('2026-10-29')).toBe('rest');
    expect(mark('2026-11-03')).toBe('empty');
    expect(mark('2026-11-01')).toBe('off'); // воскресенье
    expect(mark('2026-09-30')).toBe('before');
    expect(mark('2026-11-05')).toBe('future');
  });

  test('серия полезной: сегодняшний недобор не рвёт, слив и пропуск рвут, выходной — нет', () => {
    const h = habit('read', { startDate: '2026-10-20' });
    const checks = [
      ...daily('read', '2026-10-20', '2026-10-24'), // 5 подряд
      check('read', '2026-10-25', 0, true), // слил
      ...daily('read', '2026-10-26', '2026-10-31'),
      ...daily('read', '2026-11-03', '2026-11-03'),
    ];
    const s = snap({ habits: [h], checks, rests: [['read', '2026-11-01', '2026-11-02']] });
    const st = habitStats(h, dataOf(indexHabits(s), 'read'), TODAY);
    expect(st.streak).toBe(7); // 26–31 + 3, выходные 1–2 не рвут, сегодня ещё не отмечено
    expect(st.best).toBe(7);
    expect(st.slips).toBe(1);
    expect(st.doneDays).toBe(12);
  });

  test('вредная: чистые дни подряд, срыв обнуляет', () => {
    const h = habit('smoke', { kind: 'bad', startDate: '2026-10-20' });
    const s = snap({ habits: [h], checks: [check('smoke', '2026-10-28')] });
    const st = habitStats(h, dataOf(indexHabits(s), 'smoke'), TODAY);
    expect(st.streak).toBe(7); // 29 окт … 4 ноя
    expect(st.best).toBe(8); // 20–27 окт
    expect(st.slips).toBe(1);
    const relapsedToday = snap({ habits: [h], checks: [check('smoke', TODAY)] });
    expect(habitStats(h, dataOf(indexHabits(relapsedToday), 'smoke'), TODAY).streak).toBe(0);
  });

  test('месяц привычки — дни по порядку', () => {
    const h = habit('x');
    const days = habitDays(
      h,
      dataOf(indexHabits(snap({})), 'x'),
      '2026-11-02',
      '2026-11-08',
      TODAY
    );
    expect(days.map((d) => d.mark)).toEqual([
      'empty',
      'empty',
      'empty',
      'future',
      'future',
      'future',
      'future',
    ]);
  });
});

describe('дела', () => {
  const s = snap({
    tasks: [
      task('debt', { date: '2026-11-03', priority: 3 }),
      task('old-done', { date: '2026-11-02', doneOn: '2026-11-02' }),
      task('debt-closed', { date: '2026-11-01', doneOn: TODAY }),
      task('low', { priority: 0 }),
      task('high', { priority: 2, areaId: 'work' }),
      task('done', { priority: 3, doneOn: TODAY }),
      task('call', { date: '2026-11-05', remindAt: '11:30' }),
      task('car', { date: '2026-11-05' }),
      task('later', { date: '2026-11-20' }),
      task('someday', { date: null }),
    ],
  });

  test('группы: долги, сегодня, завтра, позже, без даты; выполненные раньше скрыты', () => {
    const g = taskGroups(s, TODAY);
    expect(g.map((x) => [x.key, x.tasks.map((t) => t.id)])).toEqual([
      ['debts', ['debt', 'debt-closed']],
      ['today', ['high', 'low', 'done']],
      ['tomorrow', ['call', 'car']],
      ['later', ['later']],
      ['someday', ['someday']],
    ]);
  });

  test('фильтр по сфере и счётчики шапки', () => {
    expect(taskGroups(s, TODAY, { areaId: 'work' }).map((x) => x.key)).toEqual(['today']);
    expect(taskCounts(s, TODAY)).toEqual({ open: 7, debts: 1 });
  });
});

describe('день', () => {
  test('состав, луна, «Осталось» и журнал', () => {
    const s = snap({
      tasks: [
        task('debt', { date: '2026-11-03' }),
        task('protein', { doneOn: TODAY, doneAt: NOW - 2000 }),
        task('gym'),
        task('tomorrow', { date: '2026-11-05' }),
      ],
      habits: [
        habit('water', { measure: 'numeric', target: 2 }),
        habit('smoke', { kind: 'bad' }),
        habit('rise'),
        habit('rest'),
        habit('archived', { archivedAt: 1 }),
      ],
      checks: [
        { ...check('water', TODAY, 2), updatedAt: NOW - 1000 },
        check('rise', TODAY, 0, true),
      ],
      rests: [['rest', TODAY, TODAY]],
    });
    const v = dayView(s, TODAY, TODAY);
    expect(v.total).toBe(6); // debt, protein, gym, water, smoke, rise
    expect(v.done).toBe(3); // protein, water, smoke (чистый)
    expect(v.phase).toBe(0.5);
    expect(v.left.map((i) => [i.id, i.debt])).toEqual([
      ['debt', true],
      ['gym', false],
    ]);
    expect(v.log.map((i) => [i.id, i.state])).toEqual([
      ['water', 'done'],
      ['protein', 'done'],
      ['rise', 'slip'],
      ['smoke', 'done'],
    ]);
  });

  test('номер дня и серия закрытых дней', () => {
    expect(dayNumber('2026-10-01', TODAY)).toBe(35);
    const s = snap({ reviews: ['2026-11-01', '2026-11-02', '2026-11-03'] });
    expect(closedStreak(s, TODAY)).toBe(3); // сегодня ещё не закрыт — серия жива
    s.reviews[TODAY] = { ...meta(TODAY), date: TODAY, mood: 5, note: '' };
    expect(closedStreak(s, TODAY)).toBe(4);
    expect(moodPhase(1)).toBe(0);
    expect(moodPhase(5)).toBe(1);
  });
});

describe('цели', () => {
  test('номер договора, срок, порядок', () => {
    const s = snap({
      goals: [
        { ...goal('marathon', { deadline: '2026-12-20' }), createdAt: 3 },
        { ...goal('car', { deadline: '2027-02-24' }), createdAt: 4 },
        { ...goal('license', { deadline: '2026-11-01' }), createdAt: 5 },
        { ...goal('smoke', { doneOn: '2026-10-12' }), createdAt: 2 },
        { ...goal('gone'), createdAt: 1, deletedAt: 9 },
      ],
    });
    const v = goalViews(s, TODAY);
    expect(v.map((g) => [g.goal.id, g.number, g.state, g.daysLeft])).toEqual([
      ['license', 5, 'overdue', -3],
      ['marathon', 3, 'open', 46],
      ['car', 4, 'open', 112],
      ['smoke', 2, 'done', null],
    ]);
    expect(goalCounts(s)).toEqual({ total: 4, done: 1 });
  });
});

describe('очки и звания', () => {
  test('звания по порогам', () => {
    expect(rankOf(0)).toMatchObject({ key: 'pup', next: { key: 'cub', left: 300 } });
    expect(rankOf(1240)).toMatchObject({ key: 'wolf', next: { key: 'leader', left: 760 } });
    expect(rankOf(5000)).toMatchObject({ key: 'alpha', next: null });
  });

  test('очки дня: дела, норма, чистый день, слив, закрытие, полнолуние, цель', () => {
    const s = snap({
      tasks: [task('a', { doneOn: TODAY })],
      habits: [habit('good'), habit('bad', { kind: 'bad' }), habit('slip')],
      checks: [check('good', TODAY), check('slip', TODAY, 0, true)],
      goals: [goal('g', { doneOn: TODAY })],
    });
    // не закрыт: дело 10 + норма 10 + слив −10 + цель 100; чистый день вредной ещё не засчитан
    expect(dayPoints(s, TODAY, TODAY)).toBe(110);
    s.reviews[TODAY] = { ...meta(TODAY), date: TODAY, mood: 4, note: '' };
    // закрыт: + чистый 10 + закрытие 20; полнолуния нет — слил
    expect(dayPoints(s, TODAY, TODAY)).toBe(140);
    delete s.checks[checkId('slip', TODAY)];
    s.checks[checkId('slip', TODAY)] = check('slip', TODAY);
    expect(dayPoints(s, TODAY, TODAY)).toBe(
      110 + 10 + 10 + 10 + POINTS.closedDay + POINTS.fullMoon
    );
  });

  test('итог = сумма очков по дням и не ниже нуля', () => {
    const s = snap({
      tasks: [task('a', { doneOn: '2026-11-02' }), task('b', { doneOn: TODAY })],
      habits: [
        habit('h', { startDate: '2026-10-28' }),
        habit('bad', { kind: 'bad', startDate: '2026-10-30' }),
      ],
      checks: [
        ...daily('h', '2026-10-28', '2026-11-02'),
        check('bad', '2026-11-01'),
        check('h', TODAY, 0, true),
      ],
      reviews: ['2026-11-02'],
    });
    const idx = indexHabits(s);
    const sum = daysBetween('2026-10-01', TODAY).reduce(
      (n, d) => n + dayPoints(s, d, TODAY, idx),
      0
    );
    expect(totalPoints(s, TODAY)).toBe(sum);
    const sad = snap({
      habits: [habit('x', { startDate: TODAY })],
      checks: [check('x', TODAY, 0, true)],
    });
    expect(totalPoints(sad, TODAY)).toBe(0);
  });

  test('неделя стаи', () => {
    const s = snap({
      tasks: [task('a', { doneOn: TODAY }), task('b', { doneOn: '2026-10-20' })],
      habits: [
        habit('h', { startDate: '2026-10-29' }),
        habit('bad', { kind: 'bad', startDate: '2026-10-25' }),
      ],
      checks: [...daily('h', '2026-10-29', '2026-11-03'), check('bad', '2026-11-01')],
    });
    const w = packWeek(s, TODAY);
    expect(w.days.map((d) => d.marks)).toEqual([1, 1, 1, 1, 1, 1, 1]); // 29 окт … 3 ноя — привычка, сегодня — дело
    expect(w).toMatchObject({ marks: 7, tasksDone: 1, cleanStreak: 3, bestStreak: 7, slips: 1 });
    expect(packWeek(snap({}), TODAY).cleanStreak).toBeNull();
  });
});

describe('цитата дня', () => {
  test('одна на день, по кругу без повторов, только в пацанском тоне и если включены', () => {
    const on = { tone: 'bro' as const, quotes: true };
    expect(quoteOfDay(on, TODAY, 12)).toBe(quoteOfDay(on, TODAY, 12));
    const seen = new Set(daysBetween(TODAY, addDays(TODAY, 11)).map((d) => quoteOfDay(on, d, 12)));
    expect(seen.size).toBe(12);
    expect(quoteOfDay({ tone: 'plain', quotes: true }, TODAY, 12)).toBeNull();
    expect(quoteOfDay({ tone: 'bro', quotes: false }, TODAY, 12)).toBeNull();
    expect(quoteOfDay(on, TODAY, 0)).toBeNull();
  });
});

describe('настройки и новые операции', () => {
  let tick = 0;
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));
    tick = 0;
    setClock(() => NOW + tick++);
    resetForTests();
    await initData({ storage: new MemoryStorage() });
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  const data = () => useDataStore.getState().data;

  test('по умолчанию — как в макете; изменение создаёт одну запись и синхронизируемо', () => {
    expect(settingsOf(data())).toEqual(DEFAULT_SETTINGS);
    A.updateSettings({ theme: 'light', quotes: false });
    const first = data().settings[SETTINGS_ID];
    expect(settingsOf(data())).toMatchObject({ theme: 'light', quotes: false, tone: 'bro' });
    A.updateSettings({ tone: 'plain' });
    expect(data().settings[SETTINGS_ID].updatedAt).toBeGreaterThan(first.updatedAt);
    expect(Object.keys(data().settings)).toEqual([SETTINGS_ID]);
  });

  test('экспорт и импорт переносят настройки; мусор в настройках — значения по умолчанию', () => {
    A.updateSettings({ weekStart: 0, reviewAt: '22:00', locale: 'es' });
    const back = fromExportV5(JSON.parse(JSON.stringify(toExportV5(data()))), NOW, TODAY);
    expect(settingsOf(back)).toMatchObject({ weekStart: 0, reviewAt: '22:00', locale: 'es' });
    expect(
      cleanSettings({ theme: 'neon', weekStart: 3, reviewAt: '25:00', quotes: 'да' }, NOW)
    ).toMatchObject({ theme: 'system', weekStart: 1, reviewAt: '', quotes: true });
  });

  test('выполнение дела запоминает момент; возврат — сбрасывает', () => {
    const id = A.createTask({ title: 'x' });
    A.toggleTask(id);
    expect(data().tasks[id].doneAt).toBeGreaterThanOrEqual(NOW);
    A.toggleTask(id);
    expect(data().tasks[id]).toMatchObject({ doneOn: null, doneAt: null });
  });

  test('«слил сегодня» и обратно; отметка поверх слива — выполнение', () => {
    const id = A.createHabit({
      name: 'Подъём',
      kind: 'good',
      icon: 'rise',
      color: '#000000',
      days: null,
      question: '',
      remindAt: '',
      areaId: null,
      measure: 'boolean',
      unit: 'count',
      target: 1,
    });
    const c = checkId(id, TODAY);
    A.toggleSlip(id, TODAY);
    expect(data().checks[c]).toMatchObject({ value: 0, slip: true, deletedAt: null });
    expect(habitDay(data().habits[id], dataOf(indexHabits(data()), id), TODAY, TODAY).mark).toBe(
      'slip'
    );
    A.toggleCheck(id, TODAY);
    expect(data().checks[c]).toMatchObject({ value: 1, deletedAt: null });
    expect(data().checks[c].slip).toBeUndefined();
    A.toggleSlip(id, TODAY);
    A.toggleSlip(id, TODAY);
    expect(data().checks[c].deletedAt).not.toBeNull();
  });

  test('выходной на день: включить и выключить', () => {
    const id = A.createHabit({
      name: 'Читать',
      kind: 'good',
      icon: 'book',
      color: '#000000',
      days: null,
      question: '',
      remindAt: '',
      areaId: null,
      measure: 'boolean',
      unit: 'count',
      target: 1,
    });
    A.toggleRestDay(id, TODAY);
    const h = data().habits[id];
    expect(habitDay(h, dataOf(indexHabits(data()), id), TODAY, TODAY).mark).toBe('rest');
    A.toggleRestDay(id, TODAY);
    expect(habitDay(h, dataOf(indexHabits(data()), id), TODAY, TODAY).mark).toBe('empty');
  });

  test('импорт: слив без значения принимается, пустая отметка без слива — нет', () => {
    expect(cleanCheck({ habitId: 'h', date: TODAY, value: 0, slip: true }, NOW)).toMatchObject({
      slip: true,
    });
    expect(cleanCheck({ habitId: 'h', date: TODAY, value: 0 }, NOW)).toBeNull();
  });
});

describe('вычеркнуть и вернуть', () => {
  beforeEach(async () => {
    resetForTests();
    await initData({ storage: new MemoryStorage() });
  });

  test('вернуть удалённое дело — с теми же полями и датой создания, свежим updatedAt', () => {
    const id = A.createTask({ title: 'Позвонить', priority: 2 });
    const before = useDataStore.getState().data.tasks[id];
    A.deleteTask(id);
    A.restoreTask(id);
    const after = useDataStore.getState().data.tasks[id];
    expect(after).toMatchObject({ title: 'Позвонить', priority: 2, deletedAt: null });
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.updatedAt).toBeGreaterThan(before.updatedAt);
    A.restoreTask(id); // повтор ничего не меняет
    expect(useDataStore.getState().data.tasks[id].updatedAt).toBe(after.updatedAt);
  });
});

describe('правка привычки из шторки', () => {
  beforeEach(async () => {
    resetForTests();
    await initData({ storage: new MemoryStorage() });
  });

  test('меняет название, вид и напоминание; у вредной напоминания нет; пустое имя — без изменений', () => {
    const id = A.createQuickHabit({ name: 'Подъём', kind: 'good', remindAt: '06:00' });
    A.editHabitBasics(id, { name: '  Подъём в 6:00 ', kind: 'good', remindAt: '05:50' });
    expect(useDataStore.getState().data.habits[id]).toMatchObject({
      name: 'Подъём в 6:00',
      remindAt: '05:50',
    });
    A.editHabitBasics(id, { name: 'Не курить', kind: 'bad', remindAt: '07:00' });
    expect(useDataStore.getState().data.habits[id]).toMatchObject({ kind: 'bad', remindAt: '' });
    A.editHabitBasics(id, { name: '   ', kind: 'good', remindAt: '' });
    expect(useDataStore.getState().data.habits[id].name).toBe('Не курить');
  });
});

describe('договор: правка, удаление и возврат', () => {
  beforeEach(async () => {
    resetForTests();
    await initData({ storage: new MemoryStorage() });
  });

  test('правка меняет поля, пустой текст — без изменений; удалённый возвращается как был', () => {
    const id = A.createGoal(null, {
      text: 'Полумарафон',
      criterion: '',
      reward: '',
      penalty: '',
      deadline: null,
    });
    A.editGoal(id, {
      text: ' Пробежать полумарафон ',
      criterion: '21,1 км',
      reward: 'Кроссы',
      penalty: '5 000 ₽ в общак',
      deadline: '2026-12-20',
    });
    const g = useDataStore.getState().data.goals[id];
    expect(g).toMatchObject({
      text: 'Пробежать полумарафон',
      deadline: '2026-12-20',
      areaId: null,
    });
    A.editGoal(id, { text: ' ', criterion: '', reward: '', penalty: '', deadline: null });
    expect(useDataStore.getState().data.goals[id].text).toBe('Пробежать полумарафон');
    A.deleteGoal(id);
    expect(useDataStore.getState().data.goals[id].deletedAt).not.toBeNull();
    A.restoreGoal(id);
    expect(useDataStore.getState().data.goals[id]).toMatchObject({
      deletedAt: null,
      reward: 'Кроссы',
      createdAt: g.createdAt,
    });
  });
});

describe('первое напоминание завтра', () => {
  test('самое раннее среди дел на день и привычек по плану; вредные, выходные и выполненные — нет', () => {
    const tomorrow = '2026-11-05'; // четверг
    const s = snap({
      tasks: [
        task('call', { date: tomorrow, remindAt: '11:30', title: 'Созвон' }),
        task('done', { date: tomorrow, remindAt: '05:00', doneOn: TODAY }),
        task('other', { date: '2026-11-06', remindAt: '04:00' }),
      ],
      habits: [
        habit('rise', { name: 'Подъём', remindAt: '06:00' }),
        habit('early', { name: 'Рано', remindAt: '05:30', days: [1] }), // только пн
        habit('bad', { kind: 'bad', remindAt: '04:30' }),
        habit('rest', { remindAt: '05:15' }),
      ],
      rests: [['rest', tomorrow, tomorrow]],
    });
    expect(firstReminder(s, tomorrow)).toEqual({ time: '06:00', title: 'Подъём' });
    expect(firstReminder(snap({}), tomorrow)).toBeNull();
  });
});
