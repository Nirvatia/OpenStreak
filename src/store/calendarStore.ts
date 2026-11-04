import { create } from 'zustand';
import { CalendarView } from '../utils/calendar';
import { todayStr, addDays, addMonths } from '../utils/dates';

type CalendarStore = {
  calView: CalendarView;
  calCursor: string;
  calSel: string;
  setView: (view: CalendarView) => void;
  setCursor: (cursor: string) => void;
  setSel: (sel: string) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
};

function shift(view: CalendarView, cursor: string, dir: 1 | -1): string {
  if (view === 'week') return addDays(cursor, 7 * dir);
  if (view === 'month') return addMonths(cursor, dir);
  return addMonths(cursor, 12 * dir);
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calView: 'month',
  calCursor: todayStr(),
  calSel: todayStr(),
  setView: (view) => set({ calView: view }),
  setCursor: (cursor) => set({ calCursor: cursor }),
  setSel: (sel) => set({ calSel: sel }),
  navigatePrev: () => set({ calCursor: shift(get().calView, get().calCursor, -1) }),
  navigateNext: () => set({ calCursor: shift(get().calView, get().calCursor, 1) }),
}));
