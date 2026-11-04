import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as A from '../actions';
import { toLegacyState } from '../legacy';
import { fromLegacyV4, parseBackup, toExportV5 } from '../migrate';
import { checkId, live } from '../model';
import { planReminders } from '../reminders';
import { MemoryStorage } from '../storage/memory';
import { META } from '../storage/types';
import { flush, initData, replaceAll, resetForTests, setClock, useDataStore } from '../store';

const TODAY = '2026-11-04';
const NOW = new Date(`${TODAY}T12:00:00`).getTime();
let tick = 0;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(NOW));
  tick = 0;
  // Каждое обращение к часам — на 1 мс позже: так видно порядок изменений.
  setClock(() => NOW + tick++);
  resetForTests();
});

afterEach(() => {
  jest.useRealTimers();
});

const data = () => useDataStore.getState().data;

/** Состояние старой версии в том виде, в каком оно лежало под ключом CoolTick.v4. */
const LEGACY = {
  startedAt: '2026-10-01',
  tasks: [
    {
      id: 't1',
      title: 'Закрыть долг',
      date: '2026-11-03',
      priority: 3,
      notes: '',
      done: false,
      doneAt: null,
      createdAt: 1,
      area: 'a1',
      remind: '',
    },
    {
      id: 't2',
      title: 'Купить протеин',
      date: TODAY,
      priority: 0,
      notes: 'x',
      done: true,
      doneAt: TODAY,
      createdAt: 2,
      area: null,
      remind: '18:00',
    },
    { id: 'bad', title: '' },
    'мусор',
  ],
  habits: [
    {
      id: 'h1',
      name: 'Отжимания',
      type: 'good',
      emoji: 'dumbbell',
      color: '#1fb876',
      days: null,
      dates: ['2026-11-02', '2026-11-03'],
      question: '',
      remind: '09:00',
      area: 'a1',
      createdAt: '2026-10-01',
      rest: [{ f: '2026-10-10', t: '2026-10-12' }],
      progress: { '2026-11-02': 100, '2026-11-03': 100, '2026-11-04': 60 },
      measureType: 'numeric',
      unit: 'count',
      target: 100,
    },
    {
      id: 'h2',
      name: 'Не курить',
      type: 'bad',
      emoji: 'nosmoking',
      color: 'red',
      days: [1, 2, 9],
      dates: ['2026-10-20'],
      createdAt: '2026-10-12',
    },
  ],
  areas: [
    {
      id: 'a1',
      name: 'Спорт',
      color: '#ef4444',
      icon: 'target',
      goals: [
        {
          id: 'g1',
          text: 'Полумарафон',
          crit: '21 км',
          rew: 'кроссы',
          pen: '5000',
          dead: '2026-12-21',
          done: false,
          doneAt: null,
        },
      ],
    },
  ],
  moods: {
    '2026-11-03': {
      mood: 4,
      note: 'норм',
      tasksDone: 1,
      tasksTotal: 2,
      habitsDone: 1,
      habitsTotal: 1,
      perfect: false,
    },
  },
  fired: { x: 1 },
  events: [],
};

describe('перенос данных v4', () => {
  test('переносит задачи, привычки, отметки, отдых, сферы, цели и итоги дня', () => {
    const s = fromLegacyV4(LEGACY, NOW, TODAY);
    expect(s.profile.startedAt).toBe('2026-10-01');
    expect(Object.keys(s.tasks).sort()).toEqual(['t1', 't2']);
    expect(s.tasks.t2.doneOn).toBe(TODAY);
    expect(s.tasks.t2.remindAt).toBe('18:00');
    expect(s.tasks.t1.areaId).toBe('a1');

    expect(s.habits.h1.measure).toBe('numeric');
    expect(s.habits.h1.target).toBe(100);
    expect(s.checks[checkId('h1', '2026-11-04')].value).toBe(60);
    expect(s.checks[checkId('h1', '2026-11-03')].value).toBe(100);
    expect(Object.values(s.rests)).toHaveLength(1);

    expect(s.habits.h2.kind).toBe('bad');
    expect(s.habits.h2.color).toBe('#2f7cf6'); // неверный цвет заменён
    expect(s.habits.h2.days).toEqual([1, 2]); // 9 — не день недели
    expect(s.habits.h2.startDate).toBe('2026-10-12');

    expect(s.goals.g1).toMatchObject({
      areaId: 'a1',
      criterion: '21 км',
      penalty: '5000',
      deadline: '2026-12-21',
    });
    expect(s.reviews['2026-11-03']).toMatchObject({ mood: 4, note: 'норм' });
  });

  test('старое представление из перенесённых данных совпадает по смыслу с исходным', () => {
    const v = toLegacyState(fromLegacyV4(LEGACY, NOW, TODAY));
    const h1 = v.habits.find((h) => h.id === 'h1')!;
    expect(h1.dates).toEqual(['2026-11-02', '2026-11-03']); // 60 из 100 — не засчитано
    expect(h1.progress['2026-11-04']).toBe(60);
    expect(h1.rest).toEqual([{ f: '2026-10-10', t: '2026-10-12' }]);
    expect(v.areas[0].goals[0]).toMatchObject({ id: 'g1', crit: '21 км', done: false });
    expect(v.moods['2026-11-03']).toEqual({ mood: 4, note: 'норм' });
  });

  test('не похоже на состояние — ошибка, а не пустые данные', () => {
    expect(() => fromLegacyV4({ hello: 1 }, NOW, TODAY)).toThrow();
  });
});

describe('загрузка', () => {
  test('первый запуск переносит старые данные и не трогает их источник', async () => {
    const storage = new MemoryStorage();
    const read = jest.fn(async () => JSON.stringify(LEGACY));
    const res = await initData({ storage, legacy: { read } });
    expect(res.migrated).toBe(true);
    expect(live(data().tasks)).toHaveLength(2);
    expect(JSON.parse((await storage.getMeta(META.legacyMigration))!)).toMatchObject({ ok: true });

    // Повторный запуск читает уже новое хранилище, старое больше не нужно.
    resetForTests();
    const read2 = jest.fn(async () => JSON.stringify(LEGACY));
    await initData({ storage, legacy: { read: read2 } });
    expect(read2).not.toHaveBeenCalled();
    expect(live(data().habits)).toHaveLength(2);
    expect(data().profile.startedAt).toBe('2026-10-01');
  });

  test('испорченные старые данные: стартуем пустыми, ошибку запоминаем', async () => {
    const storage = new MemoryStorage();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await initData({ storage, legacy: { read: async () => '{не json' } });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(res.migrated).toBe(false);
    expect(res.legacyError).toBeTruthy();
    expect(live(data().tasks)).toHaveLength(0);
    expect(JSON.parse((await storage.getMeta(META.legacyMigration))!)).toMatchObject({ ok: false });
  });

  test('без старых данных — пустой профиль с сегодняшней датой', async () => {
    await initData({ storage: new MemoryStorage() });
    expect(data().profile.startedAt).toBe(TODAY);
    expect(useDataStore.getState().ready).toBe(true);
  });
});

describe('операции', () => {
  beforeEach(async () => {
    await initData({ storage: new MemoryStorage() });
  });

  test('изменения пишутся в хранилище одной пачкой за тик', async () => {
    const storage = new MemoryStorage();
    resetForTests();
    await initData({ storage });
    const before = storage.writes;
    A.createTask({ title: 'a' });
    A.createTask({ title: 'b' });
    A.createTask({ title: 'c' });
    jest.runOnlyPendingTimers();
    await flush();
    expect(storage.writes - before).toBe(1);
    expect((await storage.loadAll()).filter((r) => r.collection === 'tasks')).toHaveLength(3);
  });

  test('задача: создание, выполнение, мягкое удаление', () => {
    const id = A.createTask({ title: '  Позвонить маме ' });
    expect(data().tasks[id]).toMatchObject({ title: 'Позвонить маме', date: TODAY, doneOn: null });
    const created = data().tasks[id].updatedAt;

    A.toggleTask(id);
    expect(data().tasks[id].doneOn).toBe(TODAY);
    expect(data().tasks[id].updatedAt).toBeGreaterThan(created);

    A.deleteTask(id);
    expect(data().tasks[id].deletedAt).not.toBeNull(); // запись осталась — для синхронизации
    expect(toLegacyState(data()).tasks).toHaveLength(0);
  });

  test('отметка привычки: numeric засчитывается только по достижении цели', () => {
    const id = A.createHabit({
      name: 'Отжимания',
      kind: 'good',
      icon: 'dumbbell',
      color: '#000000',
      days: null,
      question: '',
      remindAt: '',
      areaId: null,
      measure: 'numeric',
      unit: 'count',
      target: 100,
    });
    A.setCheckValue(id, TODAY, 60);
    let h = toLegacyState(data()).habits[0];
    expect(h.dates).toEqual([]);
    expect(h.progress[TODAY]).toBe(60);

    A.setCheckValue(id, TODAY, 100);
    h = toLegacyState(data()).habits[0];
    expect(h.dates).toEqual([TODAY]);

    A.toggleCheck(id, TODAY); // снять
    expect(toLegacyState(data()).habits[0].dates).toEqual([]);
    A.toggleCheck(id, TODAY); // отметить целиком
    expect(data().checks[checkId(id, TODAY)].value).toBe(100);
  });

  test('удаление привычки удаляет её отметки и отдых', () => {
    const id = A.createHabit({
      name: 'X',
      kind: 'good',
      icon: 'x',
      color: '#000000',
      days: null,
      question: '',
      remindAt: '',
      areaId: null,
      measure: 'boolean',
      unit: 'count',
      target: 1,
    });
    A.toggleCheck(id, TODAY);
    A.addRest(id, '2026-11-10', '2026-11-05');
    expect(live(data().rests)[0]).toMatchObject({ from: '2026-11-05', to: '2026-11-10' });
    A.deleteHabit(id);
    expect(live(data().checks)).toHaveLength(0);
    expect(live(data().rests)).toHaveLength(0);
  });

  test('удаление сферы удаляет цели и отвязывает задачи', () => {
    const area = A.createArea({ name: 'Спорт', color: '#000000', icon: 'x' });
    A.createGoal(area, { text: 'Цель', criterion: '', reward: '', penalty: '', deadline: null });
    const task = A.createTask({ title: 'Зал', areaId: area });
    A.deleteArea(area);
    expect(live(data().goals)).toHaveLength(0);
    expect(data().tasks[task].areaId).toBeNull();
  });

  test('синхронизация целей сферы из формы', () => {
    const area = A.createArea({ name: 'Спорт', color: '#000000', icon: 'x' });
    const base = { criterion: '', reward: '', penalty: '', deadline: null };
    A.syncAreaGoals(area, [
      { id: 'g1', text: 'Один', ...base },
      { id: 'g2', text: 'Два', ...base },
    ]);
    A.syncAreaGoals(area, [
      { id: 'g2', text: 'Два!', ...base },
      { id: 'g3', text: 'Три', ...base },
    ]);
    expect(
      live(data().goals)
        .map((g) => g.text)
        .sort()
    ).toEqual(['Два!', 'Три']);
    expect(data().goals.g1.deletedAt).not.toBeNull();
  });

  test('итог дня: одна запись на день, оценка 1…5', () => {
    A.saveReview(TODAY, 9, ' ок ');
    A.saveReview(TODAY, 3, 'норм');
    expect(live(data().reviews)).toEqual([
      expect.objectContaining({ id: TODAY, mood: 3, note: 'норм' }),
    ]);
  });
});

describe('экспорт и импорт', () => {
  test('экспорт v5 → импорт возвращает те же данные без удалённых', async () => {
    await initData({
      storage: new MemoryStorage(),
      legacy: { read: async () => JSON.stringify(LEGACY) },
    });
    A.deleteTask('t1');
    const text = JSON.stringify(toExportV5(data(), 'dark'));
    const parsed = parseBackup(text, NOW, TODAY);
    expect(parsed.format).toBe(5);
    expect(parsed.theme).toBe('dark');
    expect(Object.keys(parsed.snapshot.tasks)).toEqual(['t2']);
    expect(parsed.snapshot.checks[checkId('h1', TODAY)].value).toBe(60);
  });

  test('импорт старого экспорта «CoolTick» v4', () => {
    const parsed = parseBackup(
      JSON.stringify({ app: 'CoolTick', version: 4, theme: 'light', state: LEGACY }),
      NOW,
      TODAY
    );
    expect(parsed.format).toBe(4);
    expect(Object.keys(parsed.snapshot.habits)).toHaveLength(2);
  });

  test('чужой файл — ошибка', () => {
    expect(() => parseBackup('{"foo": []}', NOW, TODAY)).toThrow();
    expect(() => parseBackup('не json', NOW, TODAY)).toThrow();
  });

  test('replaceAll: старое мягко удалено, импорт — свежее', async () => {
    await initData({ storage: new MemoryStorage() });
    const old = A.createTask({ title: 'Старое' });
    await replaceAll(fromLegacyV4(LEGACY, NOW, TODAY));
    expect(data().tasks[old].deletedAt).not.toBeNull();
    expect(
      live(data().tasks)
        .map((t) => t.id)
        .sort()
    ).toEqual(['t1', 't2']);
    expect(data().profile.startedAt).toBe('2026-10-01');
  });
});

describe('план напоминаний', () => {
  beforeEach(async () => {
    await initData({ storage: new MemoryStorage() });
  });

  const habit = (over: Partial<A.HabitInput> = {}) =>
    A.createHabit({
      name: 'Читать',
      kind: 'good',
      icon: 'book',
      color: '#000000',
      days: null,
      question: '',
      remindAt: '21:00',
      areaId: null,
      measure: 'boolean',
      unit: 'count',
      target: 1,
      ...over,
    });

  test('задача с напоминанием в будущем — одно уведомление; прошедшее и выполненное — нет', () => {
    A.createTask({ title: 'Отчёт', remindAt: '18:00' });
    A.createTask({ title: 'Утро', remindAt: '08:00' }); // уже прошло
    const done = A.createTask({ title: 'Готово', remindAt: '19:00' });
    A.toggleTask(done);
    const plan = planReminders(data(), new Date(NOW)).filter((p) => p.kind === 'task');
    expect(plan.map((p) => p.title)).toEqual(['Отчёт']);
    expect(plan[0].at.getHours()).toBe(18);
  });

  test('привычка: 7 дней вперёд, без выполненных, отдыха и дней вне плана', () => {
    const id = habit({ days: [1, 2, 3, 4, 5] }); // будни
    A.toggleCheck(id, TODAY); // сегодня уже сделано
    A.addRest(id, '2026-11-06', '2026-11-06'); // пятница — отдых
    const days = planReminders(data(), new Date(NOW))
      .filter((p) => p.kind === 'habit')
      .map((p) => p.at.toDateString());
    // ср 4 — сделано, пт 6 — отдых, сб/вс — не в плане; остаются чт 5, пн 9, вт 10
    expect(days).toEqual([
      new Date('2026-11-05T21:00').toDateString(),
      new Date('2026-11-09T21:00').toDateString(),
      new Date('2026-11-10T21:00').toDateString(),
    ]);
  });

  test('для вредной привычки напоминаний нет', () => {
    habit({ kind: 'bad' });
    expect(planReminders(data(), new Date(NOW)).filter((p) => p.kind === 'habit')).toHaveLength(0);
  });

  test('итог дня: каждый вечер в выбранное время, кроме закрытых дней; выключено — нет', () => {
    A.saveReview('2026-11-05', 4, '');
    const plan = planReminders(data(), new Date(NOW)).filter((p) => p.kind === 'review');
    // по умолчанию 21:30; 5 ноября уже закрыт заранее — пропускаем
    expect(plan.map((p) => p.subjectId)).toEqual([
      TODAY,
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
    ]);
    expect(plan[0].at.getHours()).toBe(21);
    expect(plan[0].at.getMinutes()).toBe(30);
    A.updateSettings({ reviewAt: '' });
    expect(planReminders(data(), new Date(NOW)).filter((p) => p.kind === 'review')).toHaveLength(0);
  });

  test('не больше лимита iOS и по порядку времени', () => {
    for (let i = 0; i < 12; i++) habit({ name: `П${i}` });
    const plan = planReminders(data(), new Date(NOW));
    expect(plan.length).toBeLessThanOrEqual(60);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].at.getTime()).toBeGreaterThanOrEqual(plan[i - 1].at.getTime());
    }
  });

  test('идентификатор меняется вместе со временем напоминания', () => {
    const id = A.createTask({ title: 'Отчёт', remindAt: '18:00' });
    const before = planReminders(data(), new Date(NOW))[0].id;
    A.updateTask(id, { title: 'Отчёт', remindAt: '19:00' });
    expect(planReminders(data(), new Date(NOW))[0].id).not.toBe(before);
  });
});
