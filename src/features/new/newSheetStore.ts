/** Открыта ли шторка «Новое» и с каким видом записи. */
import { create } from 'zustand';

export type NewKind = 'task' | 'habit' | 'goal';

type Store = {
  open: boolean;
  kind: NewKind;
  /** номер открытия: форма монтируется заново и начинается с чистого листа */
  seq: number;
  show: (kind?: NewKind) => void;
  hide: () => void;
};

export const useNewSheet = create<Store>((set) => ({
  open: false,
  kind: 'task',
  seq: 0,
  show: (kind = 'task') => set((st) => ({ open: true, kind, seq: st.seq + 1 })),
  hide: () => set({ open: false }),
}));
