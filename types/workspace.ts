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

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'CANCELED';
export type PlanType = 'FREE' | 'EARLY_ADOPTER';

export interface Subscription {
  id: number;
  workspace_id: number;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  canceled_at?: Date;
  trial_end_date?: Date;
  quantity_seats: number;
  stripe_subscription_id: string;
}

export interface Workspace {
  id: number;
  name: string;
  users: Array<{
    id: number;
    email: string;
    name?: string;
  }>;
  workflows: Workflow[];
  folders: Folder[];
  team_tags?: string[];
  icon_url?: string;
  background_colour?: string;
  slug?: string;
  subscription?: Subscription;
}
