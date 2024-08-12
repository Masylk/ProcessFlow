// types/block.ts
import { Workflow } from './workflow';
import { Action } from './action';
import { DelayBlock } from './delayBlock';
import { StepBlock } from './stepBlock';
import { PathBlock } from './pathBlock';

export interface Block {
  id: number;
  type: 'DELAY' | 'STEP' | 'PATH';
  position: number;
  icon: string | null;
  description: string | null;
  workflowId: number;
  workflow: Workflow;
  actions: Action[];
  delayBlock?: DelayBlock;
  stepBlock?: StepBlock;
  pathBlock?: PathBlock;
}
