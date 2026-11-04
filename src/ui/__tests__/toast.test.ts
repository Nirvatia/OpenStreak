import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { TOAST_MS, UNDO_MS, useToast } from '../toast';

const st = () => useToast.getState();

beforeEach(() => {
  jest.useFakeTimers();
  useToast.setState({ current: null, visible: false });
});
afterEach(() => {
  jest.useRealTimers();
});

describe('toast', () => {
  test('plain toast hides after TOAST_MS, text stays for the slide-out', () => {
    st().show('Готово');
    expect(st().visible).toBe(true);
    jest.advanceTimersByTime(TOAST_MS - 1);
    expect(st().visible).toBe(true);
    jest.advanceTimersByTime(1);
    expect(st().visible).toBe(false);
    expect(st().current?.text).toBe('Готово');
  });

  test('undo toast lives UNDO_MS; act runs the action once and hides', () => {
    const undo = jest.fn();
    st().show('Вычеркнул.', { label: 'Отменить', onPress: undo });
    jest.advanceTimersByTime(TOAST_MS);
    expect(st().visible).toBe(true);
    st().act();
    st().act();
    expect(undo).toHaveBeenCalledTimes(1);
    expect(st().visible).toBe(false);
  });

  test('after timeout the action can no longer run', () => {
    const undo = jest.fn();
    st().show('Вычеркнул.', { label: 'Отменить', onPress: undo });
    jest.advanceTimersByTime(UNDO_MS);
    st().act();
    expect(undo).not.toHaveBeenCalled();
  });

  test('a new toast replaces the old one and the old timer does not hide it', () => {
    const first = st().show('Первый', undefined, 1000);
    jest.advanceTimersByTime(900);
    st().show('Второй', undefined, 1000);
    jest.advanceTimersByTime(200);
    expect(st().current?.text).toBe('Второй');
    expect(st().visible).toBe(true);
    st().hide(first);
    expect(st().visible).toBe(true);
  });
});
