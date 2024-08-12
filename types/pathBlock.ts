import { Block } from './block';

export interface PathBlock {
  id: number;
  blockId: number;
  pathOptions: string[];
  block: Block;
}