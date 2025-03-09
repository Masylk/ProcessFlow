import { create } from 'zustand';
import { Path } from '../types';

interface ModalStore {
  showParallelPathModal: boolean;
  modalData: {
    path: Path | null;
    position: number;
    existingPaths: string[];
  };
  setShowModal: (show: boolean) => void;
  setModalData: (data: { path: Path; position: number; existingPaths: string[] }) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  showParallelPathModal: false,
  modalData: {
    path: null,
    position: 0,
    existingPaths: [],
  },
  setShowModal: (show) => set({ showParallelPathModal: show }),
  setModalData: (data) => set({ modalData: data }),
})); 