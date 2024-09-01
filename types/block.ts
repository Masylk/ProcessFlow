// types/block.ts
import { Workflow } from './workflow'; // Import Workflow type if needed
import { Action } from './action'; // Import Action type if needed

// Represents a Block, which might include different types of blocks
export interface Block {
  id: number;
  type: BlockType; // Use BlockType enum
  position: number;
  icon?: string; // Optional field
  description?: string; // Optional field
  workflowId: number;
  workflow?: Workflow; // Optional, representing the workflow this block belongs to
  pathBlock?: PathBlock; // Optional, if the block has a PathBlock
  stepBlock?: StepBlock; // Optional, if the block has a StepBlock
  delayBlock?: DelayBlock; // Optional, if the block has a DelayBlock
  actions?: Action[]; // Optional, actions related to this block
  pathId?: number; // Optional field for the path relationship
  path?: Path; // Optional, the path this block belongs to
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

// Represents a Path, which is associated with a single PathBlock
export interface Path {
  id: number;
  name: string; // Optional name for easier management of paths
  pathBlockId: number;
  pathBlock: PathBlock; // Reference to the PathBlock this Path belongs to
}

// Represents a PathBlock, which can contain multiple Paths
export interface PathBlock {
  id: number;
  blockId: number;
  block: Block; // Reference to the block associated with this PathBlock
  paths: Path[]; // Array of Paths associated with this PathBlock
}
