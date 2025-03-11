import { create } from 'zustand';
import { Path } from '../types';
import { Node } from 'reactflow';

interface ModalStore {
  showConnectModal: boolean;
  connectData: { sourceNode: Node } | null;
  setShowConnectModal: (show: boolean) => void;
  setConnectData: (data: { sourceNode: Node } | null) => void;
  showParallelPathModal: boolean;
  modalData: any; // Replace 'any' with proper type if available
  setShowModal: (show: boolean) => void;
  setModalData: (data: { path: Path; position: number; existingPaths: string[] }) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  showConnectModal: false,
  connectData: null,
  setShowConnectModal: (show) => set({ showConnectModal: show }),
  setConnectData: (data) => set({ connectData: data }),
  showParallelPathModal: false,
  modalData: {
    path: null,
    position: 0,
    existingPaths: [],
  },
  setShowModal: (show) => set({ showParallelPathModal: show }),
  setModalData: (data) => set({ modalData: data }),
})); 