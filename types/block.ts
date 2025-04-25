// types/block.ts
import { Workflow } from './workflow'; // Import Workflow type if needed
import { Action } from './action'; // Import Action type if needed
import { Path } from './path';

// Represents a Block, which might include different types of blocks
// Represents a Block, which might include different types of blocks
export interface Block {
  id: number;
  type: BlockType; // Use BlockType enum
  position: number;
  title: string;
  icon?: string; // Optional field
  description?: string; // Optional field
  image?: string; // Optional, URL for an image
  imageDescription?: string; // Optional, description for the image
  click_position?: { x: number; y: number } | null; // Optional, coordinates of click position
  lastModified?: Date; // Optional, last modified date
  averageTime?: string; // Optional, average time for the block
  taskType?: 'MANUAL' | 'AUTOMATIC'; // Optional, enum values as string literals
  workflow_id: number;
  workflow?: Workflow; // Optional, representing the workflow this block belongs to
  actions?: Action[]; // Optional, actions related to this block
  step_block?: step_block; // Optional, if the block has a step_block
  path_block?: path_block; // Optional, if the block has a path_block
  delay_block?: delay_block;
  path_id: number; // Required field for the path relationship
  path?: Path; // Optional, the path this block belongs to
  coordinates?: { x: number; y: number } | null; // Optional, block coordinates
  children?: Block[]; // Add this line
}

// Enum for Block types
export enum BlockType {
  BEGIN = 'BEGIN',
  DELAY = 'DELAY',
  STEP = 'STEP',
  PATH = 'PATH',
  END = 'END',
  LAST = 'LAST',
  MERGE = 'MERGE',
}

export enum BlockEndType {
  END = 'END',
  LAST = 'LAST',
  PATH = 'PATH',
  MERGE = 'MERGE',
}

export enum FormType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
}

// Represents a step_block, specific for STEP type blocks
export interface step_block {
  id: number;
  blockId: number;
  stepDetails: string; // Details specific to the step
  block?: Block; // Optional reference back to the block
}

// Represents a delay_block, specific for DELAY type blocks
export interface delay_block {
  id: number;
  blockId: number;
  seconds: number; // Duration of the delay
  block?: Block; // Optional reference back to the block
}

// Represents a path_block, which can contain multiple Paths
export interface path_block {
  id: number;
  blockId: number;
  block: Block; // Reference to the block associated with this path_block
  paths: Path[]; // Array of Paths associated with this path_block
}
