import { create } from 'zustand';
import { Block } from '../../types';

interface ClipboardStore {
  copiedBlock: Block | null;
  setCopiedBlock: (block: Block | null) => void;
}

export const useClipboardStore = create<ClipboardStore>((set) => ({
  copiedBlock: null,
  setCopiedBlock: (block) => set({ copiedBlock: block }),
})); 