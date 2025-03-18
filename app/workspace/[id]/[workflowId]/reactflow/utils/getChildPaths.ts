import { Path } from '../types';

/**
 * Returns all child paths connected to the last block of a given path
 * @param path The parent path
 * @param allPaths Array of all paths in the workflow (needed to get full path data)
 * @returns Array of child paths connected to the last block
 */
export function getChildPaths(path: Path, allPaths: Path[]): Path[] {
  if (!path || !Array.isArray(path.blocks) || path.blocks.length === 0) {
    return [];
  }

  const childPaths: Path[] = [];
  const lastBlock = path.blocks[path.blocks.length - 1];

  // Check child_paths relationships of the last block
  lastBlock.child_paths.forEach(childPathRelation => {
    // Find the full path data from allPaths
    const fullChildPath = allPaths.find(p => p.id === childPathRelation.path_id);
    if (fullChildPath) {
      childPaths.push(fullChildPath);
    }
  });

  return childPaths;
} 