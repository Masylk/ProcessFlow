import { Block } from './block';

export enum SidebarEventType {
  FOCUS,
  REORDER,
}

export interface SidebarEvent {
  type: SidebarEventType;
  path_id?: number;
  blocks?: Block[];
  focusId?: string;
}
