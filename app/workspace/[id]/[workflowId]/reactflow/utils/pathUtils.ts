import { Block } from '@/types/block';

export const getLastBlocksFromPaths = (
  pathBlock: Block,
  pathHierarchy: string = ''
): Array<{ block: Block; pathHierarchy: string }> => {
  const result: Array<{ block: Block; pathHierarchy: string }> = [];
  
  // If this is a PATH type block, we need to find its last blocks
  if (pathBlock.type === 'PATH') {
    // Here you would typically:
    // 1. Get all blocks in this path
    // 2. Find the blocks that don't have any following blocks
    // 3. Add them to results with updated hierarchy
    
    // For each last block found:
    // result.push({ block: lastBlock, pathHierarchy: `${pathHierarchy}/${pathBlock.id}` });
  } else {
    // If it's not a PATH block, it's considered a leaf node
    result.push({ block: pathBlock, pathHierarchy });
  }
  
  return result;
}; 