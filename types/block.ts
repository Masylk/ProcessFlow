// types/block.ts
import { Workflow } from './workflow';
import { Action } from './action';

export interface Block {
  id: number;
  type: string;
  position: number;
  icon?: string;
  description?: string;
  // workflowId: number;
  // workflow: Workflow;
  // actions: Action[];
}
