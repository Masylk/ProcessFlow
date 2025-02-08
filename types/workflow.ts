import { Workspace } from './workspace';
import { Block } from './block';
import { Action } from './action';

export interface Workflow {
  id: number;
  name: string;
  workspaceId: number;
  workspace: Workspace;
  blocks: Block[];
  history: Action[];
  folder_id?: number;
  team_tags: string[];
}
