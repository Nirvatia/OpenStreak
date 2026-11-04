/** Шторка «Новое»: открыта ли, какой вид записи, создаём или правим дело. */
import { create } from 'zustand';

export type NewKind = 'task' | 'habit' | 'goal';

type Store = {
  open: boolean;
  kind: NewKind;
  /** правка существующего дела; null — новая запись */
  editId: string | null;
  /** сфера по умолчанию для нового дела (например, выбранная в фильтре «Дел») */
  areaId: string | null;
  /** номер открытия: форма монтируется заново и начинается с чистого листа */
  seq: number;
  show: (kind?: NewKind, opts?: { areaId?: string | null }) => void;
  editTask: (id: string) => void;
  hide: () => void;
};

export const useNewSheet = create<Store>((set) => ({
  open: false,
  kind: 'task',
  editId: null,
  areaId: null,
  seq: 0,
  show: (kind = 'task', opts) =>
    set((st) => ({
      open: true,
      kind,
      editId: null,
      areaId: opts?.areaId ?? null,
      seq: st.seq + 1,
    })),
  editTask: (id) =>
    set((st) => ({ open: true, kind: 'task', editId: id, areaId: null, seq: st.seq + 1 })),
  hide: () => set({ open: false }),
}));
