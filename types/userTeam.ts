import { Role } from './role';
import { User } from './user';
import { Team } from './team';

export interface UserTeam {
  id: number;
  userId: number;
  teamId: number;
  role: Role;
  poles: string[];
  user: User;
  team: Team;
}

