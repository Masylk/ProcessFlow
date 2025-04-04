import { create } from 'zustand';

interface StrokeLinesState {
  allStrokeLinesVisible: boolean;
  setAllStrokeLinesVisible: (visible: boolean) => void;
  toggleAllStrokeLines: () => void;
}

export const useStrokeLinesStore = create<StrokeLinesState>((set) => ({
  allStrokeLinesVisible: true,
  setAllStrokeLinesVisible: (visible) => set({ allStrokeLinesVisible: visible }),
  toggleAllStrokeLines: () => set((state) => ({ allStrokeLinesVisible: !state.allStrokeLinesVisible })),
})); 