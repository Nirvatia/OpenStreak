import { describe, expect, test } from '@jest/globals';
import { NOTCHES_MAX, notchesPath } from '../Notches';

const strokes = (d: string) => (d.match(/M/g) ?? []).length;

describe('notchesPath', () => {
  test('one stroke per day, a slash closes each five', () => {
    expect(strokes(notchesPath(0, 24).d)).toBe(0);
    expect(strokes(notchesPath(3, 24).d)).toBe(3);
    expect(strokes(notchesPath(14, 24).d)).toBe(14);
  });
  test('above the limit: one crossed five plus the number', () => {
    const r = notchesPath(NOTCHES_MAX + 17, 24);
    expect(r.more).toBe(true);
    expect(strokes(r.d)).toBe(5);
    expect(notchesPath(NOTCHES_MAX, 24).more).toBe(false);
  });
  test('width grows by groups', () => {
    expect(notchesPath(10, 24).width).toBeGreaterThan(notchesPath(5, 24).width);
    expect(notchesPath(3, 24).width).toBe(notchesPath(5, 24).width);
  });
});
