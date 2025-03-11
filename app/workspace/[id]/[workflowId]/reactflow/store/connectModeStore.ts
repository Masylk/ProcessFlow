import { create } from 'zustand';

interface ConnectModeStore {
  isConnectMode: boolean;
  setIsConnectMode: (isConnectMode: boolean) => void;
}

export const useConnectModeStore = create<ConnectModeStore>((set) => ({
  isConnectMode: false,
  setIsConnectMode: (isConnectMode) => set({ isConnectMode }),
})); 