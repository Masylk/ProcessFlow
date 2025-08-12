import { Path } from '../../types';

/**
 * Returns all child path IDs connected to the last block of a given path
 * @param path The parent path
 * @returns Array of child path IDs from the last block
 */
export function getChildPathsIds(path: Path): number[] {
  if (!path || !Array.isArray(path.blocks) || path.blocks.length === 0) {
    return [];
  }

  const lastBlock = path.blocks[path.blocks.length - 1];
  
  // Extract path_ids from child_paths relationships
  return lastBlock.child_paths.map(childPathRelation => childPathRelation.path_id);
} 