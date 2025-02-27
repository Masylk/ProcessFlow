import { Block } from './interfaces';

export interface NodeData {
  label: string;
  position: number;
  onDelete: (id: string) => void;
  isLastInPath?: boolean;
  pathId?: number | null;
  highlighted?: boolean;
  handleAddBlockOnEdge?: (
    position: number,
    path_id: number | null,
    event?: { clientX: number; clientY: number }
  ) => void;
}

export interface EdgeData {
  blocks: Block[];
  handleAddBlockOnEdge: (
    position: number,
    path_id: number | null,
    event?: { clientX: number; clientY: number }
  ) => void;
}

export interface DropdownPosition {
  x: number;
  y: number;
  position: number;
  pathId: number | null;
} 