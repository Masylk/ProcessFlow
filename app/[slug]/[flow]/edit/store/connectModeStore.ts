import { create } from 'zustand';

interface ConnectModeStore {
  isConnectMode: boolean;
  sourceBlockId: string | null;
  targetBlockId: string | null;
  previewEdgeId: string | null;
  setIsConnectMode: (isConnectMode: boolean) => void;
  setSourceBlockId: (id: string | null) => void;
  setTargetBlockId: (id: string | null) => void;
  setPreviewEdgeId: (id: string | null) => void;
  reset: () => void;
}

export const useConnectModeStore = create<ConnectModeStore>((set) => ({
  isConnectMode: false,
  sourceBlockId: null,
  targetBlockId: null,
  previewEdgeId: null,
  setIsConnectMode: (isConnectMode) => set({ isConnectMode }),
  setSourceBlockId: (id) => set({ sourceBlockId: id }),
  setTargetBlockId: (id) => set({ targetBlockId: id }),
  setPreviewEdgeId: (id) => set({ previewEdgeId: id }),
  reset: () => set({
    isConnectMode: false,
    sourceBlockId: null,
    targetBlockId: null,
    previewEdgeId: null,
  }),
})); 