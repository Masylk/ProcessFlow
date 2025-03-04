import { Block, Path } from '../types';

/**
 * Returns all blocks at and after the specified position in a path, excluding the END block
 * @param path The path containing the blocks
 * @param position The position from which to get blocks (inclusive)
 * @returns Array of blocks at and after the specified position, excluding END block
 */
export function getBlocksAfterPosition(path: Path, position: number): Block[] {
  if (!path || !Array.isArray(path.blocks)) {
    return [];
  }

  // Sort blocks by position to ensure correct order
  const sortedBlocks = [...path.blocks].sort((a, b) => a.position - b.position);
  
  // Filter blocks that have a position greater than or equal to the specified position
  // and are not END blocks
  return sortedBlocks.filter(block => 
    block.position >= position && block.type !== 'END'
  );
} 