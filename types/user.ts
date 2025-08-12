import { Action } from './action';
import { UserTeam } from './userTeam';

export interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  avatar_signed_url?: string;
  active_workspace_id?: number;
  hubspot_contact_id?: string;
  sentry_id?: string;
  post_hog_id?: string;
  phone?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}
