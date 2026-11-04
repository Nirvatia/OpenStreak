/** Шторка «Новое»: открыта ли, какой вид записи, создаём или правим дело / привычку. */
import { create } from 'zustand';

export type NewKind = 'task' | 'habit' | 'goal';

type Store = {
  open: boolean;
  kind: NewKind;
  /** правка существующего дела; null — новая запись */
  editId: string | null;
  /** правка существующей привычки; null — новая запись */
  editHabitId: string | null;
  /** сфера по умолчанию для нового дела (например, выбранная в фильтре «Дел») */
  areaId: string | null;
  /** номер открытия: форма монтируется заново и начинается с чистого листа */
  seq: number;
  show: (kind?: NewKind, opts?: { areaId?: string | null }) => void;
  editTask: (id: string) => void;
  editHabit: (id: string) => void;
  hide: () => void;
};

export const useNewSheet = create<Store>((set) => {
  const open = (kind: NewKind, patch: Partial<Store>) =>
    set((st) => ({
      open: true,
      kind,
      editId: null,
      editHabitId: null,
      areaId: null,
      seq: st.seq + 1,
      ...patch,
    }));
  return {
    open: false,
    kind: 'task',
    editId: null,
    editHabitId: null,
    areaId: null,
    seq: 0,
    show: (kind = 'task', opts) => open(kind, { areaId: opts?.areaId ?? null }),
    editTask: (id) => open('task', { editId: id }),
    editHabit: (id) => open('habit', { editHabitId: id }),
    hide: () => set({ open: false }),
  };
});
