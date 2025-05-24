import { Workspace } from './workspace';
import { Block } from './block';
import { Action } from './action';
import { User } from './user';

export type WorkflowStatus = 'ACTIVE' | 'DRAFT' | 'IN_REVIEW' | 'NEEDS_UPDATE' | 'ARCHIVED';

export interface Workflow {
  id: number;
  name: string;
  icon: string;
  signedIconUrl?: string;
  description: string;
  processOwner?: string;
  reviewDate?: string;
  whyExists?: string;
  howToComplete?: string;
  workspaceId: number;
  workspace: Workspace;
  blocks: Block[];
  public_access_id: string;
  history: Action[];
  folder_id?: number;
  last_opened?: Date;
  team_tags: string[];
  author: User;
  status: WorkflowStatus;
  updated_at: string;
  created_at: string;
  is_public: boolean;
}
