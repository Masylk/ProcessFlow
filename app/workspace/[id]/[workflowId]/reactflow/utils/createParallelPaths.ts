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
  try {
    const { 
      paths_to_create = ["If", "Else"],
      path_to_move = 0 
    } = options;

    if (path_to_move >= paths_to_create.length) {
      throw new Error('path_to_move index is out of bounds');
    }

    // Find any end-type block in parent path
    const parentEndBlock = parent_path.blocks.find(block => 
      Object.values(BlockEndType).includes(block.type as BlockEndType)
    );
    if (!parentEndBlock) throw new Error('No end-type block found in parent path');

    // 1. Create all parallel paths
    const createdPaths = await Promise.all(
      paths_to_create.map(async (branchName, index) => {
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

    // 3. Move blocks to specified path
    if (blocksToMove.length > 0) {
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
    if (childPathIdsToMove.length > 0) {
      await fetch('/api/paths/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_path_ids: childPathIdsToMove,
          destination_path_id: createdPaths[path_to_move].id,
        }),
      });
    }

    // 5. Link all parallel paths to parent path's END block
    await fetch('/api/paths/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_path_ids: createdPaths.map(path => path.id),
        destination_path_id: parent_path.id,
      }),
    });

    // 6. Get updated paths data
    const updatedPaths = await Promise.all(
      createdPaths.map(path => 
        fetch(`/api/paths/${path.id}?id=${path.id}`).then(res => res.json())
      )
    );

    return {
      paths: updatedPaths
    };
  } catch (error) {
    console.error('Error creating parallel paths:', error);
    throw error;
  }
}