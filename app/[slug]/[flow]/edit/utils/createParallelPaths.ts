import { Path, Block, PathParentBlock } from '../../types';
import { getBlocksAfterPosition } from './getBlocksAfterPosition';
import { getChildPathsIds } from './getChildPathsIds';
import { BlockEndType } from '@/types/block';
import { useLoadingStore } from '../store/loadingStore';

interface CreateParallelPathsOptions {
  paths_to_create?: string[];
  path_to_move?: number;
}

export async function createParallelPaths(
  currentPaths: Path[],
  parent_path: Path,
  position: number,
  options: CreateParallelPathsOptions = {},
  setPaths: (paths: Path[]) => void,
): Promise<{ updatedPaths: Path[], rollbackPaths: Path[], error?: any }> {
  // Set loading to true at the start
  const { 
    paths_to_create = ["If", "Else"],
    path_to_move = 0 
  } = options;
  
  if (path_to_move >= paths_to_create.length) {
    throw new Error('path_to_move index is out of bounds');
  }
  const blocksToMove = getBlocksAfterPosition(parent_path, position);
  const childPathIdsToMove = getChildPathsIds(parent_path);
  
  // Find any end-type block in parent path
  const parentEndBlock = parent_path.blocks.find(block => 
    Object.values(BlockEndType).includes(block.type as BlockEndType)
  );
  if (!parentEndBlock) throw new Error('No end-type block found in parent path');
  
  // --- OPTIMISTIC UPDATE LOGIC ---
  const nowStr = new Date().toISOString();
  const parentBlockId = parentEndBlock.id;
  const parentPathId = parent_path.id;

  // Simulate IDs for optimistic UI
  const now = Date.now();
  const optimisticParentBlockId = -Math.floor(Math.random() * 1e9);
  const createdPathsWithBlocks: Path[] = (paths_to_create).map((branchName, idx) => {
    const fakePathId = now + idx; // fake unique ID
    const beginBlockId = -Math.floor(Math.random() * 1e9);
    const lastBlockId = -Math.floor(Math.random() * 1e9);

    // Default: BEGIN and LAST block
    const beginBlock: Block = {
      id: beginBlockId,
      type: 'BEGIN',
      position: 0,
      title: 'Begin',
      icon: null,
      description: null,
      image: null,
      original_image: null,
      image_description: null,
      average_time: null,
      task_type: null,
      delay_event: null,
      delay_type: null,
      workflow_id: parent_path.workflow_id,
      path_id: fakePathId,
      click_position: null,
      workflow: parent_path.workflow,
      path: {} as Path, // will be set later
      child_paths: [],
      created_at: nowStr,
      updated_at: nowStr,
      step_details: null,
      delay_seconds: null,
      last_modified: null,
    };

    const lastBlock: Block = {
      ...beginBlock,
      id: lastBlockId,
      type: BlockEndType.LAST,
      position: 1, // will be updated below
      title: 'End',
    };

    // Restore parentBlockRel for default paths
    const parentBlockRel: PathParentBlock = {
      path_id: fakePathId,
      block_id: optimisticParentBlockId,
      created_at: nowStr,
      path: {} as Path,
      block: { ...parentEndBlock, id: optimisticParentBlockId },
    };

    if (idx === path_to_move) {
      // Use fake blocks based on blocksToMove, positioned between BEGIN and LAST
      const fakeBlocks = blocksToMove.map((block, i) => ({
        ...block,
        id: -Math.floor(Math.random() * 1e9), // negative fake id
        path_id: fakePathId,
        position: i + 1, // position after BEGIN
      }));
      // Set correct positions for begin and last
      return {
        id: fakePathId,
        name: branchName,
        workflow_id: parent_path.workflow_id,
        workflow: parent_path.workflow,
        blocks: [
          beginBlock,
          ...fakeBlocks,
          { ...lastBlock, position: fakeBlocks.length + 1 }
        ],
        parent_blocks: [parentBlockRel], // will be set below
      };
    }

    // Default: just BEGIN and LAST, with parentBlockRel
    return {
      id: fakePathId,
      name: branchName,
      workflow_id: parent_path.workflow_id,
      workflow: parent_path.workflow,
      blocks: [beginBlock, lastBlock],
      parent_blocks: [parentBlockRel], // restored here
    };
  });

  // Add all these child_paths into the last block of the parent_path
  const newChildPaths: PathParentBlock[] = createdPathsWithBlocks.map((path) => ({
    path_id: path.id,
    block_id: optimisticParentBlockId,
    created_at: nowStr,
    path: path,
    block: parentEndBlock,
  }));

  // Return the updated paths array (for the path store)
  const updatedPaths = [
    ...currentPaths,
    ...createdPathsWithBlocks,
  ].map((p) => {
    if (p.id === parentPathId) {
      // Update the last block's child_paths
      const updatedBlocks = p.blocks.map((b) =>
        b.id === parentBlockId
          ? { ...b, type: BlockEndType.PATH, child_paths: [...(b.child_paths || []), ...newChildPaths], id: optimisticParentBlockId }
          : b
      );
      return { ...p, blocks: updatedBlocks };
    }
    return p;
  });

  // --- SET OPTIMISTIC PATHS BEFORE FETCHES ---
  console.log('HERE CREATE PARALLEL PATHS');

  console.log('HERE SET PATHS');
  setPaths(updatedPaths);
  
  // --- FETCHES (side effects) ---
  try {
    // 1. Create all parallel paths via API
    const createdPaths = await Promise.all(
      paths_to_create.map(async (branchName) => {
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
    console.log('createdPaths', createdPaths);

    // 2. Get blocks after position and child paths IDs

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
    const updatedParentPath = await fetch('/api/paths/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_path_ids: createdPaths.map(path => path.id),
        destination_path_id: parent_path.id,
      }),
    });

    // After fetching updatedParentPath
    const updatedParentPathJson = await updatedParentPath.json();

    // Find the last block in updatedParentPath
    const lastBlock = updatedParentPathJson.blocks[updatedParentPathJson.blocks.length - 1];

    // Map real created paths, setting parent_blocks to lastBlock.child_paths (filtered by path id)
    const updatedCreatedPaths = createdPaths.map((path, idx) => ({
      ...path,
      parent_blocks: lastBlock.child_paths
        ? lastBlock.child_paths.filter((cp: any) => cp.path_id === path.id)
        : [],
    }));

    // Remove only optimistic paths (do NOT remove parent_path)
    const filteredPaths = currentPaths.filter(
      p => p.id !== parent_path.id
    );

    // Find the last block in both parent_path and updatedParentPathJson
    const parentBlocks = parent_path.blocks;
    const updatedBlocksFromBackend = updatedParentPathJson.blocks;
    const lastBlockIdx = parentBlocks.length - 1;
    const updatedLastBlockFromBackend = updatedBlocksFromBackend[updatedBlocksFromBackend.length - 1];

    const blocksToMoveIds = new Set(blocksToMove.map(b => b.id));
    const updatedParentBlocks = parentBlocks
      .filter(
        block =>
          // Remove if it's in blocksToMove AND is NOT a BlockEndType
          !(blocksToMoveIds.has(block.id) && !Object.values(BlockEndType).includes(block.type as BlockEndType))
      )
      .map((block, idx, arr) => {
        // Update the last block's child_paths as before
        if (idx === arr.length - 1) {
          return {
            ...block,
            type: BlockEndType.PATH,
            child_paths: updatedLastBlockFromBackend.child_paths
          };
        }
        return block;
      });
    const updatedParentPathCp = { ...parent_path, blocks: updatedParentBlocks };

    // Add real created paths and the updated parent path
    const newPaths = [
      ...filteredPaths,
      ...updatedCreatedPaths,
      updatedParentPathCp,
    ];

    console.log('newPaths', newPaths);
    // Update the store
    setPaths(newPaths);

    console.log('isloading', useLoadingStore.getState().isLoading);
    // At the end, set loading to false
    return { updatedPaths: newPaths, rollbackPaths: currentPaths };
  } catch (error) {
    // On error, set loading to false
    if (setPaths) setPaths(currentPaths); // rollback
    return { updatedPaths: currentPaths, rollbackPaths: currentPaths, error };
  }
}