import { create } from 'zustand';

interface UpdateModeStore {
  isUpdateMode: boolean;
  mergePathId: number | null;
  selectedEndBlocks: number[];
  originalEndBlocks: number[];
  setUpdateMode: (enabled: boolean) => void;
  setMergePathId: (id: number | null) => void;
  setSelectedEndBlocks: (blockIds: number[]) => void;
  setOriginalEndBlocks: (blocks: number[]) => void;
  toggleEndBlockSelection: (blockId: number) => void;
  reset: () => void;
}

export const useUpdateModeStore = create<UpdateModeStore>((set, get) => ({
  isUpdateMode: false,
  mergePathId: null,
  selectedEndBlocks: [],
  originalEndBlocks: [],
  setUpdateMode: (enabled) => set({ isUpdateMode: enabled }),
  setMergePathId: (id) => set({ mergePathId: id }),
  setSelectedEndBlocks: (blockIds) => set({ selectedEndBlocks: blockIds }),
  setOriginalEndBlocks: (blocks) => set({ originalEndBlocks: blocks }),
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
  }),
})); 