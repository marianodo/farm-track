import { create } from 'zustand';

interface SyncState {
  pendingCount: number;
  syncing: boolean;
  setPending: (count?: number) => void;
  setSyncing: (value: boolean) => void;
  getPendingCount: () => number;
}

const useSyncStore = create<SyncState>((set, get) => ({
  pendingCount: 0,
  syncing: false,
  setPending: (count?: number) => {
    if (count !== undefined) {
      set({ pendingCount: count });
    } else {
      set((state) => ({ pendingCount: state.pendingCount + 1 }));
    }
  },
  setSyncing: (value: boolean) => set({ syncing: value }),
  getPendingCount: () => get().pendingCount,
}));

export default useSyncStore; 