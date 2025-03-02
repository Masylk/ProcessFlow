import { Path, Block } from '../types';

export async function createParallelPaths(parent_path: Path, position: number) {
  try {
    // 1. Create first parallel path with BEGIN, STEP, END
    const firstPath = await fetch('/api/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${parent_path.name} - Branch 1`,
        workflow_id: parent_path.workflow_id,
      }),
    });
    const firstPathData = await firstPath.json();

    console.log("created first path", firstPathData);
    // 2. Create second parallel path with BEGIN, STEP, END
    const secondPath = await fetch('/api/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${parent_path.name} - Branch 2`,
        workflow_id: parent_path.workflow_id,
      }),
    });
    const secondPathData = await secondPath.json();
    console.log("created second path", secondPathData);
    // Wait for blocks to be created and fetch updated paths
    const [updatedFirstPath, updatedSecondPath] = await Promise.all([
      fetch(`/api/paths/${firstPathData.id}?id=${firstPathData.id}`).then(res => res.json()),
      fetch(`/api/paths/${secondPathData.id}?id=${secondPathData.id}`).then(res => res.json()),
    ]);


    // Link both parallel paths to parent path's END block
    const parentEndBlock = parent_path.blocks.find(block => block.type === 'END');
    if (!parentEndBlock) throw new Error('No END block found in parent path');

    await fetch('/api/paths/parent-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relationships: [
          { path_id: updatedFirstPath.id, block_id: parentEndBlock.id },
          { path_id: updatedSecondPath.id, block_id: parentEndBlock.id },
        ],
      }),
    });

    console.log("linked parent path to parallel paths");
    return { 
      firstPath: updatedFirstPath, 
      secondPath: updatedSecondPath 
    };
  } catch (error) {
    console.error('Error creating parallel paths:', error);
    throw error;
  }
}

// Function to move blocks from one path to another
export async function moveBlocks(
  sourcePathId: number,
  targetPathId: number,
  workflow_id: number,
  fromPosition: number,
  blocks: Block[],
  excludeType: string = 'END'
) {
  // Get blocks to move
  const blocksToMove = blocks
    .filter(block => 
      block.position >= fromPosition && 
      block.type !== excludeType &&
      block.position < blocks.find(b => b.type === excludeType)?.position!
    )
    .map(block => ({
      ...block,
      id: undefined,
      path_id: targetPathId,
    }));

  if (blocksToMove.length > 0) {
    // Create blocks in target path
    await fetch('/api/blocks/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: blocksToMove,
        path_id: targetPathId,
        workflow_id,
      }),
    });

    // Delete blocks from source path
    const blockIdsToDelete = blocks
      .filter(block => 
        block.position >= fromPosition && 
        block.type !== excludeType &&
        block.position < blocks.find(b => b.type === excludeType)?.position!
      )
      .map(block => block.id);

    await fetch('/api/blocks/batch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_ids: blockIdsToDelete }),
    });
  }

  return blocksToMove;
}

// Separate function for merge path creation (unused for now)
export async function createMergePath(parent_path: Path, position: number, firstPathData: any, secondPathData: any) {
  // Create merge path
  const mergePath = await fetch('/api/paths', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${parent_path.name} - Merge`,
      workflow_id: parent_path.workflow_id,
    }),
  });
  const mergePathData = await mergePath.json();

  // Move blocks from parent path to merge path
  await moveBlocks(
    parent_path.id,
    mergePathData.id,
    parent_path.workflow_id,
    position,
    parent_path.blocks
  );

  // Get END blocks of both parallel paths
  const [firstPathEndBlock, secondPathEndBlock] = await Promise.all([
    fetch(`/api/paths/${firstPathData.id}/blocks?type=END`).then(res => res.json()),
    fetch(`/api/paths/${secondPathData.id}/blocks?type=END`).then(res => res.json()),
  ]);

  // Link merge path to both END blocks
  await fetch('/api/paths/parent-blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      relationships: [
        { path_id: mergePathData.id, block_id: firstPathEndBlock.id },
        { path_id: mergePathData.id, block_id: secondPathEndBlock.id },
      ],
    }),
  });

  return mergePathData;
} 