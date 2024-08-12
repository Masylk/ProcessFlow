import { UserTeam } from './userTeam';
import { Workspace } from './workspace';

export interface Team {
  id: number;
  name: string;
  userTeams: UserTeam[];
  workspaces: Workspace[];
}