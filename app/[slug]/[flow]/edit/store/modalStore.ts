import { create } from 'zustand';
import { NodeData, Path, StrokeLine } from '../../types';
import { Node } from '@xyflow/react';

interface ModalStore {
  showConnectModal: boolean;
  connectData: { 
    sourceNode: Node;
    targetNode?: Node;
  } | null;
  setShowConnectModal: (show: boolean) => void;
  setConnectData: (data: { sourceNode: Node; targetNode?: Node } | null) => void;
  showParallelPathModal: boolean;
  modalData: any; // Replace 'any' with proper type if available
  setShowModal: (show: boolean) => void;
  setModalData: (data: { path: Path; position: number; existingPaths: string[] }) => void;
  showEditLinksModal: boolean;
  editLinksData: {
    sourceNode: Node<NodeData>;
  } | null;
  setShowEditLinksModal: (show: boolean) => void;
  setEditLinksData: (data: { sourceNode: Node<NodeData> } | null) => void;
  onStrokeLinesUpdate?: React.Dispatch<React.SetStateAction<StrokeLine[]>>;
  setOnStrokeLinesUpdate: (fn: React.Dispatch<React.SetStateAction<StrokeLine[]>> | undefined) => void;
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
  showEditLinksModal: false,
  editLinksData: null,
  setShowEditLinksModal: (show) => set({ showEditLinksModal: show }),
  setEditLinksData: (data) => set({ editLinksData: data }),
  onStrokeLinesUpdate: undefined,
  setOnStrokeLinesUpdate: (fn) => set({ onStrokeLinesUpdate: fn }),
})); 