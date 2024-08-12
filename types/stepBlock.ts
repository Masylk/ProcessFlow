import { Block } from './block';

export interface StepBlock {
  id: number;
  blockId: number;
  stepDetails: string;
  block: Block;
}