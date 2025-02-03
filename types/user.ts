import { Action } from './action';
import { UserTeam } from './userTeam';

export interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  avatar_signed_url?: string;
  active_workspace?: number;
  email: string;
}
