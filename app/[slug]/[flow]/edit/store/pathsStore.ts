import { create } from 'zustand';
import { Path } from '../../types';

interface PathsStore {
  paths: Path[];
  setPaths: (paths: Path[] | ((currentPaths: Path[]) => Path[])) => void;
}

export const usePathsStore = create<PathsStore>((set) => ({
  paths: [],
  setPaths: (paths) => set((state) => ({ 
    paths: typeof paths === 'function' ? paths(state.paths) : paths 
  })),
})); 