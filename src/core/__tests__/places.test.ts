import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as A from '../actions';
import { live } from '../model';
import {
  RADIUS_MAX,
  RADIUS_MIN,
  clampRadius,
  distanceMeters,
  formatCoords,
  neededPlaceIds,
  parseCoordinates,
  pickZones,
} from '../places';
import { resetForTests, setClock, useDataStore } from '../store';

const MSK = { latitude: 55.7558, longitude: 37.6173 };

describe('parseCoordinates', () => {
  test.each([
    ['55.7558, 37.6173'],
    ['55.7558 37.6173'],
    ['55.7558;37.6173'],
    ['55,7558 37,6173'],
    ['  55.7558,37.6173  '],
    ['geo:55.7558,37.6173?z=17'],
    ['https://www.google.com/maps/place/Astella/@55.7558,37.6173,17z/data=!3m1'],
    ['https://www.google.com/maps/search/?api=1&query=55.7558%2C37.6173'],
    ['https://maps.google.com/?q=55.7558,37.6173'],
    // Яндекс: порядок «долгота, широта»
    ['https://yandex.ru/maps/?ll=37.6173%2C55.7558&z=16'],
    ['https://yandex.ru/maps/213/moscow/?ll=37.617300,55.755800&pt=37.6173,55.7558&z=17'],
    // 2ГИС: тоже «долгота, широта»
    ['https://2gis.ru/moscow?m=37.6173%2C55.7558%2F16'],
    ['https://www.openstreetmap.org/?mlat=55.7558&mlon=37.6173#map=17/55.7558/37.6173'],
    ['https://www.openstreetmap.org/#map=17/55.7558/37.6173'],
  ])('%s', (text) => {
    const c = parseCoordinates(text);
    expect(c).not.toBeNull();
    expect(c!.latitude).toBeCloseTo(MSK.latitude, 4);
    expect(c!.longitude).toBeCloseTo(MSK.longitude, 4);
  });

  test('отрицательные координаты', () => {
    expect(parseCoordinates('-33.8688, 151.2093')).toEqual({
      latitude: -33.8688,
      longitude: 151.2093,
    });
  });

  test.each([
    [''],
    ['магазин Astella'],
    ['https://maps.app.goo.gl/AbCdEf123'],
    ['https://yandex.ru/maps/-/CCUAZ4~k'],
    ['91, 37'],
    ['55, 181'],
    ['1, 2, 3'],
    ['NaN, 10'],
    ['javascript:alert(1)'],
    ['%E0%A4%A'],
  ])('не координаты: %s', (text) => {
    expect(parseCoordinates(text)).toBeNull();
  });

  test('очень длинный текст не ломает разбор', () => {
    expect(parseCoordinates('9'.repeat(100000))).toBeNull();
  });
});

describe('формат координат', () => {
  test('показ и обратный разбор совпадают', () => {
    const text = formatCoords(MSK);
    expect(text).toBe('55.75580, 37.61730');
    expect(parseCoordinates(text)).toEqual(MSK);
  });
});

describe('радиус и расстояние', () => {
  test('радиус зажимается в допустимые рамки', () => {
    expect(clampRadius(10)).toBe(RADIUS_MIN);
    expect(clampRadius(99999)).toBe(RADIUS_MAX);
    expect(clampRadius(150.4)).toBe(150);
    expect(clampRadius(NaN)).toBe(150);
  });

  test('расстояние: 0 до себя, ~111 км на градус широты', () => {
    expect(distanceMeters(MSK, MSK)).toBe(0);
    const d = distanceMeters(MSK, { ...MSK, latitude: MSK.latitude + 1 });
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111400);
  });
});

describe('места в данных', () => {
  let tick = 0;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-04T12:00:00'));
    tick = 0;
    setClock(() => 1_000_000 + tick++);
    resetForTests();
  });
  const data = () => useDataStore.getState().data;

  test('создание, правка и мягкое удаление', () => {
    const id = A.createPlace({ name: '  Astella ', ...MSK, radius: 20 });
    expect(data().places[id]).toMatchObject({ name: 'Astella', radius: RADIUS_MIN });
    A.updatePlace(id, { name: 'Astella 2', ...MSK, radius: 300 });
    expect(data().places[id]).toMatchObject({ name: 'Astella 2', radius: 300 });
    A.deletePlace(id);
    expect(data().places[id]!.deletedAt).not.toBeNull();
    A.restorePlace(id);
    expect(data().places[id]!.deletedAt).toBeNull();
  });

  test('некорректные координаты не записываются', () => {
    expect(() => A.createPlace({ name: 'x', latitude: 99, longitude: 0, radius: 150 })).toThrow();
    expect(live(data().places)).toHaveLength(0);
  });

  test('удаление места отвязывает дела и привычки', () => {
    const place = A.createPlace({ name: 'Дом', ...MSK, radius: 150 });
    const task = A.createTask({ title: 'Полить цветы', placeId: place, placeTrigger: 'enter' });
    A.deletePlace(place);
    expect(data().tasks[task]).toMatchObject({ placeId: null, placeTrigger: null });
  });

  test('привязка к месту: по умолчанию вход, без места триггер сбрасывается', () => {
    const place = A.createPlace({ name: 'Дом', ...MSK, radius: 150 });
    const task = A.createTask({ title: 'Позвонить', placeId: place });
    expect(data().tasks[task]).toMatchObject({ placeId: place, placeTrigger: 'enter' });
    A.updateTask(task, { title: 'Позвонить', placeTrigger: 'exit', placeId: place });
    expect(data().tasks[task]!.placeTrigger).toBe('exit');
    A.updateTask(task, { title: 'Позвонить' });
    expect(data().tasks[task]).toMatchObject({ placeId: place, placeTrigger: 'exit' });
    A.updateTask(task, { title: 'Позвонить', placeId: null });
    expect(data().tasks[task]).toMatchObject({ placeId: null, placeTrigger: null });
  });

  test('нужные места и выбор под лимит', () => {
    const a = A.createPlace({ name: 'A', ...MSK, radius: 150 });
    const b = A.createPlace({ name: 'B', ...MSK, latitude: 56.5, radius: 150 });
    const c = A.createPlace({ name: 'C', ...MSK, latitude: 59, radius: 150 });
    A.createPlace({ name: 'без дел', ...MSK, radius: 150 });
    A.createTask({ title: '1', placeId: a, placeTrigger: 'enter' });
    A.createTask({ title: '2', placeId: b, placeTrigger: 'exit' });
    A.createTask({ title: '3', placeId: c, placeTrigger: 'enter' });
    const needed = neededPlaceIds(data());
    expect([...needed].sort()).toEqual([a, b, c].sort());
    expect(pickZones(data().places, needed, 2).map((p) => p.name)).toEqual(['A', 'B']);
    // ближайшие к точке рядом с C
    expect(
      pickZones(data().places, needed, 2, { latitude: 59, longitude: 37.6 }).map((p) => p.name)
    ).toEqual(['C', 'B']);
    expect(pickZones(data().places, needed, 0)).toEqual([]);
  });
});
