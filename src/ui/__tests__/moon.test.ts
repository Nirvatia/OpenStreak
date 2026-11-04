import { describe, expect, test } from '@jest/globals';
import { clampPhase, dayPhase, habitPhase, litPath, moodPhase, moonLook } from '../moon';

describe('phases', () => {
  test('clamp', () => {
    expect(clampPhase(-1)).toBe(0);
    expect(clampPhase(2)).toBe(1);
    expect(clampPhase(Number.NaN)).toBe(0);
  });
  test('day: empty day is new moon, all done is full', () => {
    expect(dayPhase(0, 0)).toBe(0);
    expect(dayPhase(3, 9)).toBeCloseTo(1 / 3);
    expect(dayPhase(9, 9)).toBe(1);
    expect(dayPhase(12, 9)).toBe(1);
  });
  test('numeric habit', () => {
    expect(habitPhase(60, 100)).toBeCloseTo(0.6);
    expect(habitPhase(150, 100)).toBe(1);
    expect(habitPhase(1, 0)).toBe(1);
    expect(habitPhase(0, 0)).toBe(0);
  });
  test('mood 1…5 → new … full moon', () => {
    expect([1, 2, 3, 4, 5].map(moodPhase)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
});

describe('litPath', () => {
  test('new moon has no lit part, full moon is a circle', () => {
    expect(litPath(0)).toBeNull();
    expect(litPath(1)).toContain('A46 46 0 1 1');
  });
  test('crescent bulges right (sweep 0), gibbous left (sweep 1)', () => {
    expect(litPath(0.25)).toMatch(/A23 46 0 0 0 50 4 Z$/);
    expect(litPath(0.75)).toMatch(/A23 46 0 0 1 50 4 Z$/);
    expect(litPath(0.5)).toMatch(/A0 46 0 0 1 50 4 Z$/);
  });
});

describe('moonLook', () => {
  test('slip is a full red moon, rest is a dashed new moon', () => {
    expect(moonLook('slip')).toEqual({ phase: 1, tone: 'red', ring: 'red', dashed: false });
    expect(moonLook('rest')).toMatchObject({ phase: 0, dashed: true });
    expect(moonLook('partial', 0.6).phase).toBeCloseTo(0.6);
  });
});
