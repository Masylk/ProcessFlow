// types/path.ts

import { Block } from './block'; // Adjust the import path based on your project structure

export interface Path {
  id: number;           // Unique identifier for the path
  name: string;         // Name of the path
  workflowId: number;   // ID of the workflow the path belongs to
  pathBlockId?: number; // Optional ID for a related path block (can be null)
  blocks: Block[];      // Array of blocks contained within this path
}
