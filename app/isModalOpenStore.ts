import { create } from 'zustand';

interface IsModalOpenStore {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const useIsModalOpenStore = create<IsModalOpenStore>((set) => ({
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
})); 