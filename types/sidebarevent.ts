import { Block } from "./block";

export enum SidebarEventType {
  FOCUS,
  REORDER,
}

export interface SidebarEvent {
  type: SidebarEventType;
  pathId?: number;
  blocks?: Block[];
  focusId?: string;
}
