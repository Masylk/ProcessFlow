import { Block } from './block';
import { PathObject } from './sidebar';

export enum CanvasEventType {
  PATH_CREATION,
  SUBPATH_CREATION,
  BLOCK_ADD,
  BLOCK_DEL,
  BLOCK_REORDER,
  BLOCK_UPDATE,
  BLOCK_POSITION,
}

export interface CanvasEvent {
  type: CanvasEventType;
  path_id: number;
  blockId?: number;
  pathName?: string;
  blocks?: Block[];
  subpaths?: PathObject[];
  coordinates?: { x: number; y: number };
  handleBlocksReorder?: (reorderedBlocks: Block[]) => Promise<void>;
}
