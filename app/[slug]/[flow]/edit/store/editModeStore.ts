import { create } from 'zustand';

interface EditModeState {
  isEditMode: boolean;
  selectedNodeId: string | null;
  setEditMode: (isEditMode: boolean, nodeId?: string | null) => void;
}

export const useEditModeStore = create<EditModeState>((set) => ({
  isEditMode: false,
  selectedNodeId: null,
  setEditMode: (isEditMode, nodeId = null) => set({ isEditMode, selectedNodeId: nodeId }),
})); 