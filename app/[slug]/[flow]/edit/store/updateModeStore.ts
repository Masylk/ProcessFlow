import { create } from 'zustand';

interface UpdateModeStore {
  isUpdateMode: boolean;
  mergePathId: number | null;
  selectedEndBlocks: number[];
  originalEndBlocks: number[];
  triggerPathId: number | null;
  setUpdateMode: (isUpdateMode: boolean) => void;
  setMergePathId: (mergePathId: number | null) => void;
  setSelectedEndBlocks: (selectedEndBlocks: number[]) => void;
  setOriginalEndBlocks: (originalEndBlocks: number[]) => void;
  setTriggerPathId: (triggerPathId: number | null) => void;
  toggleEndBlockSelection: (blockId: number) => void;
  reset: () => void;
}

export const useUpdateModeStore = create<UpdateModeStore>((set, get) => ({
  isUpdateMode: false,
  mergePathId: null,
  selectedEndBlocks: [],
  originalEndBlocks: [],
  triggerPathId: null,
  setUpdateMode: (isUpdateMode) => set({ isUpdateMode }),
  setMergePathId: (mergePathId) => set({ mergePathId }),
  setSelectedEndBlocks: (selectedEndBlocks) => set({ selectedEndBlocks }),
  setOriginalEndBlocks: (originalEndBlocks) => set({ originalEndBlocks }),
  setTriggerPathId: (triggerPathId) => set({ triggerPathId }),
  toggleEndBlockSelection: (blockId) => {
    const { selectedEndBlocks } = get();
    if (selectedEndBlocks.includes(blockId)) {
      set({ selectedEndBlocks: selectedEndBlocks.filter(id => id !== blockId) });
    } else {
      set({ selectedEndBlocks: [...selectedEndBlocks, blockId] });
    }
  },
  reset: () => set({
    isUpdateMode: false,
    mergePathId: null,
    selectedEndBlocks: [],
    originalEndBlocks: [],
    triggerPathId: null,
  }),
})); 