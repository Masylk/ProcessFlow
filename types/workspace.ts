import { Workflow } from './workflow';

export interface Folder {
  id: number;
  name: string;
  workspace_id: number;
  parent_id?: number;
  team_tags: string[];
  icon_url?: string;
  emote?: string;
}

export interface Workspace {
  id: number;
  name: string;
  workflows: Workflow[];
  folders: Folder[];
  team_tags?: string[];
  icon_url?: string;
  background_colour?: string;
  slug?: string;
}
