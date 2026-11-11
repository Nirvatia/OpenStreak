/** Шторка с объяснением перед запросом доступа «Всегда»: открыта ли. */
import { create } from 'zustand';

type Store = { open: boolean; show: () => void; hide: () => void };

export const usePlaceAccess = create<Store>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
