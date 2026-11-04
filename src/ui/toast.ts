/**
 * Очередь тостов: в каждый момент виден один; новый заменяет старый.
 * Тост с действием («Отменить») живёт 5 секунд, без действия — 2,5.
 */
import { create } from 'zustand';

export type ToastAction = { label: string; onPress: () => void };
export type ToastData = { id: number; text: string; action?: ToastAction };

export const TOAST_MS = 2500;
export const UNDO_MS = 5000;

type ToastStore = {
  /** последний показанный тост — остаётся, пока плашка уезжает */
  current: ToastData | null;
  visible: boolean;
  show: (text: string, action?: ToastAction, ms?: number) => number;
  hide: (id?: number) => void;
  /** нажали действие: выполнить и закрыть */
  act: () => void;
};

let nextId = 1;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<ToastStore>((set, get) => ({
  current: null,
  visible: false,
  show: (text, action, ms) => {
    const id = nextId++;
    if (timer) clearTimeout(timer);
    set({ current: { id, text, action }, visible: true });
    timer = setTimeout(() => get().hide(id), ms ?? (action ? UNDO_MS : TOAST_MS));
    return id;
  },
  hide: (id) => {
    const { current: cur, visible } = get();
    if (!cur || !visible || (id !== undefined && cur.id !== id)) return;
    if (timer) clearTimeout(timer);
    timer = null;
    set({ visible: false });
  },
  act: () => {
    const { current: cur, visible } = get();
    if (!cur?.action || !visible) return;
    get().hide(cur.id);
    cur.action.onPress();
  },
}));

/** Показать тост вне React. */
export const showToast = (text: string, action?: ToastAction, ms?: number) =>
  useToast.getState().show(text, action, ms);
