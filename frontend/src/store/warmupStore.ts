import { create } from 'zustand';

interface WarmupState {
  isWarming: boolean;
  progress: number; // 0-100
  currentStep: string;
  setWarming: (warming: boolean) => void;
  setProgress: (progress: number, step?: string) => void;
}

const useWarmupStore = create<WarmupState>((set) => ({
  isWarming: false,
  progress: 0,
  currentStep: '',
  setWarming: (warming) => set({ isWarming: warming, progress: warming ? 0 : 100 }),
  setProgress: (progress, step) => set({ 
    progress, 
    currentStep: step || '' 
  }),
}));

export default useWarmupStore;
