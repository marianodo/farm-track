import { create } from 'zustand';

interface OfflineState {
  pendingCount: number;
  isProcessing: boolean;
  lastSync: string | null;
  setPendingCount: (count: number) => void;
  setIsProcessing: (processing: boolean) => void;
  setLastSync: (timestamp: string) => void;
  incrementPending: () => void;
  decrementPending: () => void;
}

const useOfflineStore = create<OfflineState>((set) => ({
  pendingCount: 0,
  isProcessing: false,
  lastSync: null,
  
  setPendingCount: (count: number) => set({ pendingCount: count }),
  setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
  setLastSync: (timestamp: string) => set({ lastSync: timestamp }),
  
  incrementPending: () => set((state) => ({ 
    pendingCount: state.pendingCount + 1 
  })),
  
  decrementPending: () => set((state) => ({ 
    pendingCount: Math.max(0, state.pendingCount - 1) 
  })),
}));

export default useOfflineStore;
