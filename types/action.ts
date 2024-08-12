import { User } from './user';
import { Block } from './block';
import { Workflow } from './workflow';

export interface Action {
  id: number;
  userId: number;
  user: User;
  type: string;
  targetId: number;
  target: Block;
  workflowId: number;
  workflow: Workflow;
  value: number;
}