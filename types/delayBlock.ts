import { Block } from './block';

export interface DelayBlock {
  id: number;
  blockId: number;
  delay: number;
  block: Block;
}