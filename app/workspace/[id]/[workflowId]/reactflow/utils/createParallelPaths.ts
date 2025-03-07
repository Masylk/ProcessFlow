import { Path, Block } from '../types';
import { getBlocksAfterPosition } from './getBlocksAfterPosition';
import { getChildPathsIds } from './getChildPathsIds';
import { BlockEndType } from '@/types/block';

interface CreateParallelPathsOptions {
  paths_to_create?: string[];
  path_to_move?: number;
}

export async function createParallelPaths(
  parent_path: Path, 
  position: number,
  options: CreateParallelPathsOptions = {}
) {
  console.log('options', options);
  try {
    const { 
      paths_to_create = ["If", "Else"],
      path_to_move = 0 
    } = options;

    console.log('paths_to_create', paths_to_create);
    if (path_to_move >= paths_to_create.length) {
      throw new Error('path_to_move index is out of bounds');
    }

    // Find any end-type block in parent path
    const parentEndBlock = parent_path.blocks.find(block => 
      Object.values(BlockEndType).includes(block.type as BlockEndType)
    );
    if (!parentEndBlock) throw new Error('No end-type block found in parent path');

    // Get existing child paths
    const existingChildPaths = parentEndBlock.child_paths.map(cp => cp.path);
    
    // Filter out paths that already exist (case-insensitive comparison)
    const pathsToCreate = paths_to_create.filter(newPath => 
      !existingChildPaths.some(existingPath => 
        existingPath.name.toLowerCase() === newPath.toLowerCase()
      )
    );

    if (pathsToCreate.length === 0) {
      throw new Error('All specified paths already exist in the parent path');
    }

    // 1. Create new parallel paths
    const createdPaths = await Promise.all(
      pathsToCreate.map(async (branchName) => {
        const response = await fetch('/api/paths/minimal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${branchName}`,
            workflow_id: parent_path.workflow_id,
          }),
        });
        return response.json();
      })
    );

    // 2. Get blocks after position and child paths IDs
    const blocksToMove = getBlocksAfterPosition(parent_path, position);
    const childPathIdsToMove = getChildPathsIds(parent_path);

    console.log('blocksToMove', blocksToMove);
    console.log('childPathIdsToMove', childPathIdsToMove);
    
    // 3. Move blocks to specified path (if path_to_move is within the new paths)
    if (blocksToMove.length > 0 && path_to_move < createdPaths.length) {
      await fetch('/api/blocks/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_ids: blocksToMove.map(block => block.id),
          destination_path_id: createdPaths[path_to_move].id,
        }),
      });
    }

    // 4. Move child paths to specified path
    if (childPathIdsToMove.length > 0 && path_to_move < createdPaths.length) {
      console.log('connecting child paths', childPathIdsToMove);
      await fetch('/api/paths/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_path_ids: childPathIdsToMove,
          destination_path_id: createdPaths[path_to_move].id,
        }),
      });
    }

    // 5. Link all parallel paths (both new and existing) to parent path's END block
    const allChildPathIds = [
      ...createdPaths.map(path => path.id),
      ...existingChildPaths.map(path => path.id)
    ];

    await fetch('/api/paths/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_path_ids: allChildPathIds,
        destination_path_id: parent_path.id,
      }),
    });

    // 6. Get updated paths data
    const updatedPaths = await Promise.all([
      ...createdPaths.map(path => 
        fetch(`/api/paths/${path.id}?id=${path.id}`).then(res => res.json())
      ),
      ...existingChildPaths.map(path =>
        fetch(`/api/paths/${path.id}?id=${path.id}`).then(res => res.json())
      )
    ]);

    return {
      paths: updatedPaths
    };
  } catch (error) {
    console.error('Error creating parallel paths:', error);
    throw error;
  }
}