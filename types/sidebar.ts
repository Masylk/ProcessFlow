import { Block, BlockType } from './block';

export interface SidebarBlock {
  id: number;
  type: BlockType;
  position: number;
  icon?: string;
  title?: string;
  description?: string;
  subpaths?: PathObject[];
}

export interface PathObject {
  id: number;
  name: string;
  blocks?: SidebarBlock[];
  handleBlocksReorder?: (reorderedBlocks: Block[]) => Promise<void>;
}
