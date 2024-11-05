import { Action } from './action';
import { UserTeam } from './userTeam';

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  password: string;
  actions: Action[];
  userTeams: UserTeam[];
}
