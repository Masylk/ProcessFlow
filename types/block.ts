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
  clickPosition?: { x: number; y: number } | null; // Optional, coordinates of click position
  lastModified?: Date; // Optional, last modified date
  averageTime?: string; // Optional, average time for the block
  taskType?: 'MANUAL' | 'AUTOMATIC'; // Optional, enum values as string literals
  workflowId: number;
  workflow?: Workflow; // Optional, representing the workflow this block belongs to
  actions?: Action[]; // Optional, actions related to this block
  delayBlock?: DelayBlock; // Optional, if the block has a DelayBlock
  stepBlock?: StepBlock; // Optional, if the block has a StepBlock
  pathBlock?: PathBlock; // Optional, if the block has a PathBlock
  pathId: number; // Required field for the path relationship
  path?: Path; // Optional, the path this block belongs to
  coordinates?: { x: number; y: number } | null; // Optional, block coordinates
}

// Enum for Block types
export enum BlockType {
  DELAY = 'DELAY',
  STEP = 'STEP',
  PATH = 'PATH',
}

// Represents a StepBlock, specific for STEP type blocks
export interface StepBlock {
  id: number;
  blockId: number;
  stepDetails: string; // Details specific to the step
  block?: Block; // Optional reference back to the block
}

// Represents a DelayBlock, specific for DELAY type blocks
export interface DelayBlock {
  id: number;
  blockId: number;
  delay: number; // Duration of the delay
  block?: Block; // Optional reference back to the block
}

// Represents a PathBlock, which can contain multiple Paths
export interface PathBlock {
  id: number;
  blockId: number;
  block: Block; // Reference to the block associated with this PathBlock
  paths: Path[]; // Array of Paths associated with this PathBlock
}
