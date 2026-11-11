import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as A from '../actions';
import { neededTriggers } from '../places';
import { ALERT_MIN_GAP_MS, placeAlerts, shouldFire } from '../placeAlerts';
import { resetForTests, setClock, useDataStore } from '../store';

const TODAY = '2026-11-04';
const MSK = { latitude: 55.7558, longitude: 37.6173 };
const data = () => useDataStore.getState().data;
let tick = 0;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(`${TODAY}T12:00:00`));
  tick = 0;
  setClock(() => 1_000_000 + tick++);
  resetForTests();
});

const habit = (
  name: string,
  place: string,
  trigger: 'enter' | 'exit',
  kind: 'good' | 'bad' = 'good'
) => A.createQuickHabit({ name, kind, remindAt: '', placeId: place, placeTrigger: trigger });

describe('напоминания по месту', () => {
  test('дело: вход срабатывает, выход нет; будущее и выполненное — нет', () => {
    const shop = A.createPlace({ name: 'Astella', ...MSK, radius: 150 });
    const a = A.createTask({ title: 'Купить футболку', placeId: shop, placeTrigger: 'enter' });
    A.createTask({ title: 'На выходе', placeId: shop, placeTrigger: 'exit' });
    A.createTask({ title: 'Завтра', date: '2026-11-05', placeId: shop, placeTrigger: 'enter' });
    const done = A.createTask({ title: 'Уже купил', placeId: shop, placeTrigger: 'enter' });
    A.toggleTask(done);
    A.createTask({ title: 'Без даты', date: null, placeId: shop, placeTrigger: 'enter' });

    const enter = placeAlerts(data(), shop, 'enter', TODAY);
    expect(enter.map((x) => x.title).sort()).toEqual(['Без даты', 'Купить футболку']);
    expect(enter.find((x) => x.subjectId === a)).toMatchObject({
      kind: 'task',
      placeName: 'Astella',
      key: `${shop}:enter:t:${a}`,
    });
    expect(placeAlerts(data(), shop, 'exit', TODAY).map((x) => x.title)).toEqual(['На выходе']);
  });

  test('привычка: только полезная, не выполненная сегодня', () => {
    const gym = A.createPlace({ name: 'Зал', ...MSK, radius: 150 });
    const h = habit('Тренировка', gym, 'enter');
    habit('Не курить', gym, 'enter', 'bad');
    expect(placeAlerts(data(), gym, 'enter', TODAY).map((x) => x.title)).toEqual(['Тренировка']);
    A.toggleCheck(h, TODAY);
    expect(placeAlerts(data(), gym, 'enter', TODAY)).toEqual([]);
  });

  test('удалённое место и чужое место молчат', () => {
    const gym = A.createPlace({ name: 'Зал', ...MSK, radius: 150 });
    A.createTask({ title: 'Х', placeId: gym, placeTrigger: 'enter' });
    expect(placeAlerts(data(), 'nope', 'enter', TODAY)).toEqual([]);
    A.deletePlace(gym);
    expect(placeAlerts(data(), gym, 'enter', TODAY)).toEqual([]);
  });

  test('на что ловить: вход и выход для одного места', () => {
    const p = A.createPlace({ name: 'Дом', ...MSK, radius: 150 });
    A.createTask({ title: '1', placeId: p, placeTrigger: 'enter' });
    expect(neededTriggers(data()).get(p)).toEqual({ enter: true, exit: false });
    A.createTask({ title: '2', placeId: p, placeTrigger: 'exit' });
    expect(neededTriggers(data()).get(p)).toEqual({ enter: true, exit: true });
  });

  test('защита от повторов', () => {
    expect(shouldFire(undefined, 1000)).toBe(true);
    expect(shouldFire(1000, 1000 + ALERT_MIN_GAP_MS - 1)).toBe(false);
    expect(shouldFire(1000, 1000 + ALERT_MIN_GAP_MS)).toBe(true);
    // часы ушли назад — не блокируем навсегда
    expect(shouldFire(5000, 1000)).toBe(true);
  });
});
