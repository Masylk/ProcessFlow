import { Block } from './interfaces';

export interface NodeData {
  label: string;
  position: number;
  type?: string;
  onDelete?: (id: string) => void;
  pathId: number | null;
  handleAddBlockOnEdge?: (position: number, pathId: number | null, event: React.MouseEvent) => void;
  isLastInPath?: boolean;
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