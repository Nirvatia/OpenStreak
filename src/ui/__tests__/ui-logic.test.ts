import { describe, expect, test } from '@jest/globals';
import { filledTicks } from '../ProgressTicks';
import { TALLY_MAX, tallyLayout } from '../Tally';

describe('tallyLayout', () => {
  test.each([
    [0, { groups: 0, rest: 0, overflow: false }],
    [3, { groups: 0, rest: 3, overflow: false }],
    [5, { groups: 1, rest: 0, overflow: false }],
    [14, { groups: 2, rest: 4, overflow: false }],
    [TALLY_MAX, { groups: 6, rest: 0, overflow: false }],
    [TALLY_MAX + 1, { groups: 1, rest: 0, overflow: true }],
    [-2, { groups: 0, rest: 0, overflow: false }],
  ])('%p', (n, layout) => {
    expect(tallyLayout(n)).toEqual(layout);
  });
});

describe('filledTicks', () => {
  test.each([
    [0, 100, 0],
    [60, 100, 6],
    [99, 100, 9],
    [100, 100, 10],
    [150, 100, 10],
    [1, 3, 3],
    [5, 0, 0],
  ])('%p of %p → %p', (done, total, ticks) => {
    expect(filledTicks(done, total)).toBe(ticks);
  });
});
