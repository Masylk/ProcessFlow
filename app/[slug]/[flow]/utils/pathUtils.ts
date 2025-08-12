import { Path, Block } from '../types';
import { BlockEndType } from '@/types/block';

// Function to get the great grandparent path ID
export const getGreatGrandParentPathId = (path: Path, paths: Path[]): number | null => {
  // Get parent path
  const parentBlock = path.parent_blocks[0]?.block_id;
  if (!parentBlock) return null;

  // Find parent path
  const parentPath = paths.find((p) =>
    p.blocks.some((b) => b.id === parentBlock)
  );
  if (!parentPath) return null;

  // Get grandparent path
  const grandParentBlock = parentPath.parent_blocks[0]?.block_id;
  if (!grandParentBlock) return null;

  // Find grandparent path
  const grandParentPath = paths.find((p) =>
    p.blocks.some((b) => b.id === grandParentBlock)
  );
  if (!grandParentPath) return null;

  // Get great grandparent path
  const greatGrandParentBlock = grandParentPath.parent_blocks[0]?.block_id;
  if (!greatGrandParentBlock) return null;

  // Find and return great grandparent path ID
  const greatGrandParentPath = paths.find((p) =>
    p.blocks.some((b) => b.id === greatGrandParentBlock)
  );
  return greatGrandParentPath?.id ?? null;
};

export const organizePaths = (paths: Path[]) => {
  if (!paths || !Array.isArray(paths)) {
    return { mainPaths: [], mergePaths: [], paths: [] };
  }

  const mergeChildPaths = new Set<number>();
  const mainPathsArray: Path[] = [];
  const mergePathsArray: Path[] = [];

  if (!paths || paths.length === 0) {
    return { mainPaths: [], mergePaths: [] };
  }

  // Collect merge paths (avoiding duplicates)
  paths.forEach((path) => {
    path.blocks.forEach((block) => {
      if (block.type === 'MERGE') {
        const child_paths = paths.filter((p) =>
          block.child_paths?.some((childPath) => childPath.path.id === p.id)
        );
        child_paths.forEach((childPath) => {
          if (!mergeChildPaths.has(childPath.id)) {
            mergeChildPaths.add(childPath.id);
            mergePathsArray.push(childPath);
          }
        });
      }
    });
  });

  // Find first path
  paths.forEach((path) => {
    if (path.parent_blocks.length === 0) {
      mainPathsArray.push(path);
    }
  });

  // Process merge paths
  mergePathsArray.forEach((mergePath) => {
    const greatGrandParentId = getGreatGrandParentPathId(mergePath, paths);

    if (!greatGrandParentId) {
      mainPathsArray.push(mergePath);
    } else {
      // Find great grandparent path and add merge path to its last block's child_paths
      const greatGrandParent = paths.find((p) => p.id === greatGrandParentId);
      if (greatGrandParent) {
        const lastBlock = greatGrandParent.blocks[greatGrandParent.blocks.length - 1];
        if (!lastBlock.child_paths) {
          lastBlock.child_paths = [];
        }
        if (!lastBlock.child_paths.some((p) => p.path.id === mergePath.id)) {
          // Find parent path and process child paths
          const parent_path = paths.find((p) =>
            p.blocks.some((block) => block.id === mergePath.parent_blocks[0]?.block_id)
          );

          const grandparent_path = paths.find((p) =>
            p.blocks.some((block) => block.id === parent_path?.parent_blocks[0]?.block_id)
          );

          if (grandparent_path) {
            const grandparentIndex = lastBlock.child_paths.findIndex(
              (cp) => cp.path_id === grandparent_path.id
            );

            if (grandparentIndex !== -1) {
              // Process child paths movement
              const grandparent_last_block = grandparent_path.blocks[grandparent_path.blocks.length - 1];
              const childPathsToMove = grandparent_last_block.child_paths.filter(
                (childPath) =>
                  !mergePath.parent_blocks.some((pb) => {
                    const lastBlockOfChildPath = paths
                      .find((p) => p.id === childPath.path_id)
                      ?.blocks.slice(-1)[0];
                    return lastBlockOfChildPath?.id === pb.block_id;
                  })
              );

              // Update child paths
              grandparent_last_block.child_paths = grandparent_last_block.child_paths.filter(
                (cp) => !childPathsToMove.includes(cp)
              );

              lastBlock.child_paths.splice(grandparentIndex + 1, 0, {
                path: mergePath,
                path_id: mergePath.id,
                block_id: lastBlock.id,
                created_at: new Date().toISOString(),
                block: lastBlock,
              });

              // Update merge path's last block
              mergePath.blocks[mergePath.blocks.length - 1].type = BlockEndType.PATH;
              const mergePathLastBlock = mergePath.blocks[mergePath.blocks.length - 1];
              if (!mergePathLastBlock.child_paths) {
                mergePathLastBlock.child_paths = [];
              }
              mergePathLastBlock.child_paths.push(...childPathsToMove);
            }
          }
        }
      }
    }
  });

  return {
    mainPaths: mainPathsArray,
    mergePaths: mergePathsArray,
    paths,
  };
}; 