import { Path, Block, PathParentBlock } from '../../types';
import { getBlocksAfterPosition } from './getBlocksAfterPosition';
import { getChildPathsIds } from './getChildPathsIds';
import { BlockEndType } from '@/types/block';
import { useLoadingStore } from '../store/loadingStore';

interface CreateParallelPathsOptions {
  paths_to_create?: string[];
  path_to_move?: number;
  pathblock_title?: string;
  pathblock_description?: string;
  pathblock_icon?: string;
}

function updateCreatedPaths(
  currentPaths: Path[],
  createdPaths: Path[],
  blocksToMove: Block[],
  path_move_idx: number,
  updatedLastBlockFromBackend: Block,
  childPathIdsToMove: number[]
): {paths: Path[], path_to_move: Path | null} {
  let path_to_move: Path | null = null;
  let paths = createdPaths.map((path, idx) => {
    if (idx === path_move_idx && blocksToMove.length > 0) {
      // Find begin and last blocks
      const beginBlock = path.blocks.find((b: Block) => b.type === 'BEGIN');
      let lastBlock = path.blocks.find((b: Block) => b.type === BlockEndType.LAST);

      // Prepare moved blocks with correct path_id and position, filter out BlockEndType
      const movedBlocks = blocksToMove
        .filter((b: Block) => b.type !== BlockEndType.LAST)
        .map((b, i) => ({
          ...b,
          path_id: path.id,
          position: i + 1,
        }));
 
      if (childPathIdsToMove.length > 0 && lastBlock) {
        lastBlock.child_paths = childPathIdsToMove.map((cpid) => ({
          path_id: cpid,
          block_id: lastBlock.id,
          created_at: new Date().toISOString(),
          path: currentPaths.find((p) => p.id === cpid) as Path,
          block: lastBlock,
        }));
        lastBlock.type = BlockEndType.PATH;
      }
      // Rebuild blocks: [BEGIN, ...movedBlocks, LAST]
      const newBlocks = [
        ...(beginBlock ? [beginBlock] : []),
        ...movedBlocks,
        ...(lastBlock ? [{ ...lastBlock, position: movedBlocks.length + 1 }] : []),
      ];

      path_to_move = {
        ...path,
        blocks: newBlocks,
        parent_blocks: updatedLastBlockFromBackend && updatedLastBlockFromBackend.child_paths
          ? updatedLastBlockFromBackend.child_paths.filter((cp: any) => cp.path_id === path.id)
          : [],
      };
      return path_to_move;
    }
    // All other paths: just update parent_blocks as before
    return {
      ...path,
      parent_blocks: updatedLastBlockFromBackend && updatedLastBlockFromBackend.child_paths
        ? updatedLastBlockFromBackend.child_paths.filter((cp: any) => cp.path_id === path.id)
        : [],
    };
  });
  return { paths, path_to_move };
}

function createOptimisticPaths(
  currentPaths: Path[],
  paths_to_create: string[],
  path_to_move_idx: number,
  blocksToMove: Block[],
  childPathIdsToMove: number[],
  parent_path: Path,
  parentEndBlock: Block,
  optimisticParentBlockId: number,
  now: number,
  nowStr: string
): {paths: Path[], path_to_move: Path | null} {
  let path_to_move: Path | null = null;
  let paths: Path[] = paths_to_create.map((branchName, idx) => {
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

    if (idx === path_to_move_idx) {
      // Use fake blocks based on blocksToMove, positioned between BEGIN and LAST
      const movedBlocks = blocksToMove
        .filter((b: Block) => b.type !== BlockEndType.LAST)
        .map((b, i) => ({
          ...b,
          id: -Math.floor(Math.random() * 1e9), // negative fake id
          path_id: fakePathId,
          position: i + 1, // position after BEGIN
        }));

      if (childPathIdsToMove.length > 0) {
        const lastParentBlock = parent_path.blocks[parent_path.blocks.length - 1];
        lastBlock.child_paths = childPathIdsToMove.map((cpid) => ({
          path_id: cpid,
          block_id: lastBlock.id,
          created_at: nowStr,
          path: currentPaths.find((p) => p.id === cpid) as Path,
          block: lastBlock,
        }));
        lastBlock.type = BlockEndType.PATH;
        lastBlock.title = lastParentBlock.title;
        lastBlock.description = lastParentBlock.description;
        lastBlock.icon = lastParentBlock.icon;
      }
      // Set correct positions for begin and last
      path_to_move = {
        id: fakePathId,
        name: branchName,
        workflow_id: parent_path.workflow_id,
        workflow: parent_path.workflow,
        blocks: [
          beginBlock,
          ...movedBlocks,
          { ...lastBlock, position: movedBlocks.length + 1 }
        ],
        parent_blocks: [parentBlockRel], // will be set below
      };
      return path_to_move;
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

  return { paths, path_to_move };

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
    path_to_move = 0,
    pathblock_title = "If",
    pathblock_description = "",
    pathblock_icon = "",
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
  const { paths: optimisticPaths, path_to_move: optimisticPathToMove } = createOptimisticPaths(
    currentPaths,
    paths_to_create,
    path_to_move,
    blocksToMove,
    childPathIdsToMove,
    parent_path,
    parentEndBlock,
    optimisticParentBlockId,
    now,
    nowStr
  );

  // Add all these child_paths into the last block of the parent_path
  const newChildPaths: PathParentBlock[] = optimisticPaths.map((path) => ({
    path_id: path.id,
    block_id: optimisticParentBlockId,
    created_at: nowStr,
    path: path,
    block: parentEndBlock,
  }));

  const optimisticPathToMoveLastBlock = optimisticPathToMove?.blocks.find((b) => b.type === BlockEndType.PATH);
  // Return the updated paths array (for the path store)
  const updatedPaths = [
    ...currentPaths,
    ...optimisticPaths,
  ].map((p) => {
    if (p.id === parentPathId) {
      // Update the last block's child_paths
      const blocksToMoveIds = new Set(blocksToMove?.map(b => b.id) ?? []);
      const updatedBlocks = p.blocks
        .filter(b => !blocksToMoveIds.has(b.id))
        .map((b) =>
          b.id === parentBlockId
            ? { ...b, type: BlockEndType.PATH, child_paths: [...(b.child_paths || []), ...newChildPaths], id: optimisticParentBlockId, title: pathblock_title, description: pathblock_description, icon: pathblock_icon }
            : b
        );
      return { ...p, blocks: updatedBlocks };
    }
    else if (childPathIdsToMove.includes(p.id) && optimisticPathToMoveLastBlock) {
      const parentBlock = optimisticPathToMoveLastBlock.child_paths.find(
        (cp: PathParentBlock) => cp.path_id === p.id
      );
      return { ...p, parent_blocks: parentBlock ? [parentBlock] : [] };
    }
    return p;
  });

  // --- SET OPTIMISTIC PATHS BEFORE FETCHES ---
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

    // 2. Transform last block into a PATH block
    // await fetch('/api/blocks/'

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

    const parentPathLastBlock = parent_path.blocks[parent_path.blocks.length - 1];
    // 4. Move child paths to specified path
    let updatedPathToMoveResponse = null;
    if (childPathIdsToMove.length > 0) {
      const response = await fetch('/api/paths/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_path_ids: childPathIdsToMove,
          destination_path_id: createdPaths[path_to_move].id,
          pathblock_title: parentPathLastBlock.title,
          pathblock_description: parentPathLastBlock.description,
          pathblock_icon: parentPathLastBlock.icon,
        }),
      });

      updatedPathToMoveResponse = await response.json();
      
    }

    // 5. Link all parallel paths to parente path's END block
    const updatedParentPath = await fetch('/api/paths/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_path_ids: createdPaths.map(path => path.id),
        destination_path_id: parent_path.id,
        pathblock_title: pathblock_title,
        pathblock_description: pathblock_description,
        pathblock_icon: pathblock_icon,
      }),
    });

    // After fetching updatedParentPath
    const updatedParentPathJson = await updatedParentPath.json();


    const parentBlocks = parent_path.blocks;
    const updatedBlocksFromBackend = updatedParentPathJson.blocks;
    const updatedLastBlockFromBackend = updatedBlocksFromBackend[updatedBlocksFromBackend.length - 1];
    // Map real created paths, setting parent_blocks to lastBlock.child_paths (filtered by path id)
    const { paths: updatedCreatedPaths, path_to_move: updatedPath } = updateCreatedPaths(
      currentPaths,
      createdPaths,
      blocksToMove,
      path_to_move,
      updatedLastBlockFromBackend,
      childPathIdsToMove
    );

    updatedCreatedPaths[path_to_move] = {...updatedCreatedPaths[path_to_move], ...updatedPathToMoveResponse};

    if (process.env.NODE_ENV === 'development') {
      console.log('updatedCreatedPaths', updatedCreatedPaths);
    }
    // Remove only optimistic paths (do NOT remove parent_path)

    const updatedPathToMoveLastBlock : Block | undefined = updatedPathToMoveResponse?.blocks.find((b: Block) => b.type === BlockEndType.PATH);
    // Find the last block in both parent_path and updatedParentPathJson

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
            child_paths: updatedLastBlockFromBackend.child_paths,
            title: pathblock_title,
            description: pathblock_description,
            icon: pathblock_icon,
          };
        }
        return block;
      });
    const updatedParentPathCp = { ...parent_path, blocks: updatedParentBlocks };

    const filteredPaths = currentPaths.filter(
      p => p.id !== parent_path.id
    ).map(p => {
      if (childPathIdsToMove.includes(p.id) && updatedPathToMoveLastBlock) {
        const parentBlock = updatedPathToMoveLastBlock.child_paths.find(
          (cp: PathParentBlock) => cp.path_id === p.id
        );
        return { ...p, parent_blocks: parentBlock ? [parentBlock] : [] };
      }
      return p;
    });
    // Add real created paths and the updated parent path
    const newPaths = [
      ...filteredPaths,
      ...updatedCreatedPaths,
      updatedParentPathCp,
    ];

    // Update the store
    setPaths(newPaths);

    // At the end, set loading to false
    return { updatedPaths: newPaths, rollbackPaths: currentPaths };
  } catch (error) {
    // On error, set loading to false
    if (setPaths) setPaths(currentPaths); // rollback
    return { updatedPaths: currentPaths, rollbackPaths: currentPaths, error };
  }
}