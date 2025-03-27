import { Workspace } from './workspace';
import { Block } from './block';
import { Action } from './action';
import { User } from './user';

export interface Workflow {
  id: number;
  name: string;
  icon: string;
  description: string;
  workspaceId: number;
  workspace: Workspace;
  blocks: Block[];
  history: Action[];
  folder_id?: number;
  last_opened?: Date;
  team_tags: string[];
  author: User
}
