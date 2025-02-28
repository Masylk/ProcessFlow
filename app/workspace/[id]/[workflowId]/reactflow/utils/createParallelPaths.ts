import { Path, Block } from '../types';

export async function createParallelPaths(parent_path: Path, position: number) {
  try {
    // 1. Create first parallel path with BEGIN, STEP, END
    const firstPath = await fetch('/api/paths', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${parent_path.name} - Branch 1`,
        workflow_id: parent_path.workflow_id,
      }),
    });
    const firstPathData = await firstPath.json();

    // 2. Create second parallel path with BEGIN, STEP, END
    const secondPath = await fetch('/api/paths', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${parent_path.name} - Branch 2`,
        workflow_id: parent_path.workflow_id,
      }),
    });
    const secondPathData = await secondPath.json();

    // 3. Create merge path
    const mergePath = await fetch('/api/paths', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${parent_path.name} - Merge`,
        workflow_id: parent_path.workflow_id,
      }),
    });
    const mergePathData = await mergePath.json();

    // 4. Get blocks to move (from position to end, excluding END block)
    const blocksToMove = parent_path.blocks
      .filter(block => 
        block.position >= position && 
        block.type !== 'END' &&
        block.position < parent_path.blocks.find(b => b.type === 'END')?.position!
      )
      .map(block => ({
        ...block,
        id: undefined,
        path_id: mergePathData.id,
      }));

    // 5. If there are blocks to move, create them in merge path
    if (blocksToMove.length > 0) {
      await fetch('/api/blocks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocks: blocksToMove,
          path_id: mergePathData.id,
          workflow_id: parent_path.workflow_id,
        }),
      });
    }

    // 6. Create parent block relationships
    // Link both parallel paths to parent path's END block
    const parentEndBlock = parent_path.blocks.find(block => block.type === 'END');
    if (!parentEndBlock) throw new Error('No END block found in parent path');

    await fetch('/api/paths/parent-blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        relationships: [
          {
            path_id: firstPathData.id,
            block_id: parentEndBlock.id,
          },
          {
            path_id: secondPathData.id,
            block_id: parentEndBlock.id,
          },
        ],
      }),
    });

    // 7. Create parent block relationships for merge path
    // Get END blocks of both parallel paths
    const [firstPathEndBlock, secondPathEndBlock] = await Promise.all([
      fetch(`/api/paths/${firstPathData.id}/blocks?type=END`).then(res => res.json()),
      fetch(`/api/paths/${secondPathData.id}/blocks?type=END`).then(res => res.json()),
    ]);

    // Link merge path to both END blocks
    await fetch('/api/paths/parent-blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        relationships: [
          {
            path_id: mergePathData.id,
            block_id: firstPathEndBlock.id,
          },
          {
            path_id: mergePathData.id,
            block_id: secondPathEndBlock.id,
          },
        ],
      }),
    });

    // 8. Delete moved blocks from parent path if any were moved
    if (blocksToMove.length > 0) {
      const blockIdsToDelete = parent_path.blocks
        .filter(block => 
          block.position >= position && 
          block.type !== 'END' &&
          block.position < parent_path.blocks.find(b => b.type === 'END')?.position!
        )
        .map(block => block.id);

      await fetch('/api/blocks/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          block_ids: blockIdsToDelete,
        }),
      });
    }

    return {
      firstPath: firstPathData,
      secondPath: secondPathData,
      mergePath: mergePathData,
    };
  } catch (error) {
    console.error('Error creating parallel paths:', error);
    throw error;
  }
} 