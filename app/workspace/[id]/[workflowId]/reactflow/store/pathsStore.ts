import { create } from 'zustand';
import { Path } from '../types';

interface PathsStore {
  paths: Path[];
  setPaths: (paths: Path[]) => void;
}

export const usePathsStore = create<PathsStore>((set) => ({
  paths: [],
  setPaths: (paths) => set({ paths }),
})); 