import { create } from 'zustand';

interface PathSelectionStore {
  selectedPaths: number[];
  selectedEndBlocks: number[];
  parentBlockId: number | null;
  workflowId: number;
  setSelectedPaths: (paths: number[]) => void;
  setParentBlockId: (id: number | null) => void;
  togglePathSelection: (pathId: number, endBlockId: number, parentBlockId: number) => void;
  reset: () => void;
}

export const usePathSelectionStore = create<PathSelectionStore>((set, get) => ({
  selectedPaths: [],
  selectedEndBlocks: [],
  parentBlockId: null,
  workflowId: parseInt(window.location.pathname.split('/')[3]), // Get from URL
  setSelectedPaths: (paths) => set({ selectedPaths: paths }),
  setParentBlockId: (id) => set({ parentBlockId: id }),
  togglePathSelection: (pathId, endBlockId, parentBlockId) => {
    const { selectedPaths, selectedEndBlocks, parentBlockId: currentParentId } = get();
    
    if (selectedPaths.includes(pathId)) {
      // Deselecting
      const newPaths = selectedPaths.filter(id => id !== pathId);
      const newEndBlocks = selectedEndBlocks.filter(id => id !== endBlockId);
      set({ 
        selectedPaths: newPaths,
        selectedEndBlocks: newEndBlocks,
        parentBlockId: newPaths.length === 0 ? null : currentParentId
      });
    } else {
      // Selecting
      set({ 
        selectedPaths: [...selectedPaths, pathId],
        selectedEndBlocks: [...selectedEndBlocks, endBlockId],
        parentBlockId: currentParentId || parentBlockId
      });
    }
    
    // Fix: Log the current state, not a modified version
    console.log('Selected Paths:', selectedPaths.includes(pathId) ? 
      selectedPaths.filter(id => id !== pathId) : 
      [...selectedPaths, pathId]);
    console.log('Parent Block ID:', parentBlockId);
  },
  reset: () => set({ selectedPaths: [], selectedEndBlocks: [], parentBlockId: null }),
})); 