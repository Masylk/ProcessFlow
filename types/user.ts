import { Action } from './action';
import { UserTeam } from './userTeam';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  actions: Action[];
  userTeams: UserTeam[];
}
