import { Workflow } from '@/types/workflow';

export interface NodeData {
  label: string;
  position: number;
  onDelete: (id: string) => void;
  isLastInPath?: boolean;
  pathId?: number | null;
  highlighted?: boolean;
  pathName?: string;
  handleAddBlockOnEdge?: (
    position: number,
    path_id: number | null,
    event?: { clientX: number; clientY: number }
  ) => void;
}

export interface EdgeData {
  blocks: Block[];
  path: Path;
  handleAddBlockOnEdge: (
    position: number,
    path: Path,
    event?: { clientX: number; clientY: number }
  ) => void;
}

export interface DropdownDatas {
  x: number;
  y: number;
  position: number;
  path: Path;
} 

// Interface for Path model
export interface Path {
  id: number;
  name: string;
  workflow_id: number;
  workflow: Workflow;  // Assuming a Workflow interface exists
  blocks: Block[];
  parent_blocks: PathParentBlock[];  // Assuming a PathParentBlock interface exists
}

// Interface for Block model
export interface Block {
  id: number;
  created_at: string;  // DateTime
  updated_at: string;  // DateTime
  last_modified?: string | null;  // DateTime | null
  type: BlockType;  // Assuming a BlockType enum exists
  step_details?: string | null;
  delay_seconds?: number | null;
  position: number;
  title?: string | null;
  icon?: string | null;
  description?: string | null;
  image?: string | null;
  image_description?: string | null;
  average_time?: string | null;
  task_type?: TaskType | null;  // Assuming a TaskType enum exists
  workflow_id: number;
  path_id: number;
  click_position?: any;  // Assuming `Json` type
  workflow: Workflow;  // Assuming a Workflow interface exists
  path: Path;
  // actions: Action[];  // Assuming an Action interface exists
  child_paths: PathParentBlock[];  // Assuming a PathParentBlock interface exists
}

// Assuming enums and other interfaces
export type BlockType = 'STEP' | 'DELAY' | 'PATH' | 'BEGIN' | 'END';  // Example enum
export type TaskType = 'TASK_TYPE_1' | 'TASK_TYPE_2';  // Example enum

export interface PathParentBlock {
  path_id: number;
  block_id: number;
  created_at: string;  // DateTime
  path: Path;
  block: Block;
}

// Add this interface if you're using custom node types
export interface CustomNode extends Node {
  parentId?: string;
  expandParent?: boolean;
}