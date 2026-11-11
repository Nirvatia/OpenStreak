import { describe, expect, test } from '@jest/globals';
import { HABIT_ICONS, UI_ICONS } from '../icons/paths';
import { PLAIN_HABIT_ICONS, PLAIN_UI_ICONS } from '../icons/plainPaths';

describe('пак иконок «Обычного»', () => {
  test('есть все иконки интерфейса и привычек, что и у «АУФ»', () => {
    expect(Object.keys(PLAIN_UI_ICONS).sort()).toEqual(Object.keys(UI_ICONS).sort());
    expect(Object.keys(PLAIN_HABIT_ICONS).sort()).toEqual(Object.keys(HABIT_ICONS).sort());
  });

  test('каждая иконка что-то рисует и укладывается в сетку 24', () => {
    for (const [name, spec] of [
      ...Object.entries(PLAIN_UI_ICONS),
      ...Object.entries(PLAIN_HABIT_ICONS),
    ]) {
      expect([name, (spec.d + (spec.dots ?? '')).length > 0]).toEqual([name, true]);
      // Абсолютные координаты команд верхнего регистра лежат в [0, 24].
      const absolute = (spec.d + ' ' + (spec.dots ?? '')).match(/[MLHVC][^A-Za-z]*/g) ?? [];
      for (const seg of absolute) {
        for (const n of seg.slice(1).match(/-?\d*\.?\d+/g) ?? []) {
          expect([name, Number(n) >= -0.01 && Number(n) <= 24.01]).toEqual([name, true]);
        }
      }
    }
  });
});
