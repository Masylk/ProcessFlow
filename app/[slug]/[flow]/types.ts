import { Workflow } from '@/types/workflow';
import { BlockEndType } from '@/types/block';

export interface NodeData {
  [key: string]: any;
  label: string;
  position: number;
  type: string;
  strokeLinesVisible?: boolean;
  updateStrokeLineVisibility?: (blockId: number, isVisible: boolean) => void;
  sourcePosition?: boolean;
  path?: Path;
  block: Block;
  onDelete?: (id: string) => void;
  onStrokeLinesUpdate?: (lines: any[]) => void;
  highlighted?: boolean;
  longestSiblingPath?: number;
  pathLength?: number;
  isLastInPath?: boolean;
  delayType?: DelayType;
  eventName?: string;
  seconds?: number;
  pathId?: number | null;
  pathName?: string;
  pathHasChildren?: boolean;
  workspaceId?: string;
  handleAddBlockOnEdge?: (
    position: number,
    path: Path,
    event?: { clientX: number; clientY: number }
  ) => void;
  onPathsUpdate?: (paths: Path[]) => void;
}

export interface EdgeData {
  blocks: Block[];
  path: Path;
  workspaceId: string;
  onPathsUpdate?: (paths: Path[]) => void;
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

export interface StrokeLine {
  id: number;
  source_block_id: number;
  target_block_id: number;
  label: string;
  control_points: { x: number; y: number }[];
}

export interface WorkflowData {
  id: string;
  name: string;
  is_public: boolean;
  public_access_id: string;
  workspace_id: string;
  workspace: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  icon?: string;
  signedIconUrl?: string;
  description?: string;
  process_owner?: string;
  review_date?: string;
  additional_notes?: string;
  author?: {
    full_name: string;
    avatar_url?: string;
    avatar_signed_url?: string;
  };
  folder?: {
    id: string;
    name: string;
    parent?: {
      id: string;
      name: string;
    };
  };
}

export enum DelayType {
  FIXED_DURATION = 'FIXED_DURATION',
  WAIT_FOR_EVENT = 'WAIT_FOR_EVENT'
}

// Interface for Block model
export interface Block {
  id: number;
  original_id?: number;
  created_at: string;  // DateTime
  updated_at: string;  // DateTime
  type: BlockType;  // Assuming a BlockType enum exists
  delay_seconds?: number | null;
  position: number;
  title?: string | null;
  icon?: string | null;
  signedIconUrl?: string | null;
  description?: string | null;
  image?: string | null;
  signedImageUrl?: string | null;
  original_image?: string | null;
  image_description?: string | null;
  average_time?: string | null;
  assignee?: string | null;
  task_type?: TaskType | null;  // Assuming a TaskType enum exists
  delay_event?: string | null;
  delay_type?: DelayType | null;  // Assuming a DelayType enum exists
  workflow_id: number;
  path_id: number;
  workflow: Workflow;  // Assuming a Workflow interface exists
  path: Path;
  child_paths: PathParentBlock[];  // Assuming a PathParentBlock interface exists
  condition?: {
    name: string;
    title: string;
    description: string;
  };
  is_endpoint?: boolean;
}

// Assuming enums and other interfaces
export type BlockType = 'STEP' | 'DELAY' | 'BEGIN' | BlockEndType;
export type TaskType = 'TASK_TYPE_1' | 'TASK_TYPE_2';  // Example enum

export interface PathParentBlock {
  path_id: number;
  block_id: number;
  created_at: string;  // DateTime
  path: Path;
  block: Block;
}

// Add this interface if you're using custom node types
export interface CustomBlock extends Node {
  parentId?: string;
  expandParent?: boolean;
}
