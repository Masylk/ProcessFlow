import { create } from 'zustand';

interface PathSelectionStore {
  selectedPaths: number[];
  selectedEndBlocks: number[];
  parentBlockId: number | null;
  workflowId: number;
  mergeMode: boolean;
  updateMode: boolean;
  setSelectedPaths: (paths: number[]) => void;
  setParentBlockId: (id: number | null) => void;
  togglePathSelection: (pathId: number, endBlockId: number, parentBlockId: number) => void;
  setMergeMode: (enabled: boolean) => void;
  setUpdateMode: (mode: boolean) => void;
  reset: () => void;
}

export const usePathSelectionStore = create<PathSelectionStore>((set, get) => ({
  selectedPaths: [],
  selectedEndBlocks: [],
  parentBlockId: null,
  workflowId: (() => {
    // Match --pf-<number> in the URL
    const match = window.location.pathname.match(/--pf-(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  })(),
  mergeMode: false,
  updateMode: false,
  setSelectedPaths: (paths) => set({ selectedPaths: paths }),
  setParentBlockId: (id) => set({ parentBlockId: id }),
  setMergeMode: (enabled) => set({ mergeMode: enabled }),
  setUpdateMode: (mode) => set({ updateMode: mode }),
  togglePathSelection: (pathId, endBlockId, parentBlockId) => {
    const { selectedPaths, selectedEndBlocks, parentBlockId: currentParentId } = get();
    
    if (selectedPaths.includes(pathId)) {
      // Deselecting
      const newPaths = selectedPaths.filter(id => id !== pathId);
      const newEndBlocks = selectedEndBlocks.filter(id => id !== endBlockId);
      
      set({ 
        selectedPaths: newPaths,
        selectedEndBlocks: newEndBlocks,
        parentBlockId: newPaths.length === 0 ? null : currentParentId,
        // Disable merge mode if no paths are selected
        mergeMode: newPaths.length > 0
      });
    } else {
      // Selecting
      set({ 
        selectedPaths: [...selectedPaths, pathId],
        selectedEndBlocks: [...selectedEndBlocks, endBlockId],
        parentBlockId: currentParentId || parentBlockId
      });
    }
  },
  reset: () => set({ 
    selectedPaths: [], 
    selectedEndBlocks: [], 
    parentBlockId: null,
    mergeMode: false,
    updateMode: false
  }),
})); 