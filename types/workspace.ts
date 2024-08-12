import { Team } from './team';
import { Workflow } from './workflow';

export interface Workspace {
  id: number;
  name: string;
  teamId: number;
  team: Team;
  workflows: Workflow[];
}