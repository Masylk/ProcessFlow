import {
    Node,
    Edge,
  } from '@xyflow/react';
import { Path } from '../types';
import { BlockEndType } from '@/types/block';
import { usePathsStore } from '../store/pathsStore';

// Helper function to get all descendant path IDs for a child path
const getDescendantPathIds = (childPath: Path | undefined): number[] => {
  if (!childPath?.blocks || childPath.blocks.length === 0) return [];
  
  const lastBlock = childPath.blocks[childPath.blocks.length - 1];
  if (!lastBlock?.child_paths) return [];

  return lastBlock.child_paths.map(cp => cp.path.id);
};

// Helper function to check if two paths share any common children
const shareCommonChildren = (path1Id: number, path2Id: number, allPaths: Path[]): boolean => {
  const fullPath1 = allPaths.find(p => p.id === path1Id);
  const fullPath2 = allPaths.find(p => p.id === path2Id);
  
  const children1 = getDescendantPathIds(fullPath1);
  const children2 = getDescendantPathIds(fullPath2);
  return children1.some(id => children2.includes(id));
};

// Sort and group child paths that share common descendants
const sortChildPaths = (childPaths: { path: { id: number } }[], allPaths: Path[]) => {
  const groups: { path: { id: number } }[][] = [];
  const used = new Set<number>();

  childPaths.forEach((cp1, i) => {
    if (used.has(cp1.path.id)) return;

    const group = [cp1];
    used.add(cp1.path.id);

    // Find all other paths that share children with this one
    childPaths.forEach((cp2, j) => {
      if (i === j || used.has(cp2.path.id)) return;
      
      if (shareCommonChildren(cp1.path.id, cp2.path.id, allPaths)) {
        group.push(cp2);
        used.add(cp2.path.id);
      }
    });

    groups.push(group);
  });

  // Flatten groups back into a single array
  return groups.flat();
};

// Recursive function to process paths into nodes and edges
export function processPath(
  path: Path,
  nodes: Node[],
  edges: Edge[],
  handleDeleteBlock: (blockId: string) => void,
  handleAddBlockOnEdge: (position: number,
    path: Path,
    event?: { clientX: number; clientY: number }) => void,
  visitedPaths = new Set<string>(),
  handlePathsUpdate: (paths: Path[]) => void,
  handleStrokeLinesUpdate: (strokeLines: any[]) => void,
  updateStrokeLineVisibility: (blockId: number, isVisible: boolean) => void,
  strokeLineVisibilities: [number, boolean][],
  hasSiblings: boolean = false
): void {
  const allPaths = usePathsStore.getState().paths;
  
  if (visitedPaths.has(path.id.toString())) return; // Avoid infinite loops
  visitedPaths.add(path.id.toString());

  path.blocks.forEach((block, index) => {
    const nodeId = `block-${block.id}`;
    const visibility = strokeLineVisibilities.find(([id]) => id === block.id)?.[1] ?? true;

    // Find end block and check for child paths
    const endBlock = path.blocks.find(block => 
      block.type === 'END' || block.type === 'LAST' || block.type === 'PATH' || block.type === 'MERGE'
    );
    console.log('path', path);
    console.log('endBlock', endBlock);
    const pathHasChildren = endBlock?.child_paths && endBlock.child_paths.length > 0;
    const pathIsMerged = endBlock?.child_paths && endBlock.child_paths.length  === 1;
    nodes.push({
      id: nodeId,
      type: block.type === 'BEGIN' 
        ? 'begin' 
        : block.type === BlockEndType.END
          ? 'end'
          : block.type === BlockEndType.LAST
            ? 'last'
            : block.type === BlockEndType.PATH
              ? 'path'
              : block.type === BlockEndType.MERGE
                ? 'merge'
                : 'custom',
      position: { 
        x: 0,
        y: 0
      },
      data: {
        label: block.title || block.step_details || 'Block',
        position: block.position,
        type: block.type,
        onDelete: handleDeleteBlock,
        pathId: block.path_id,
        path: path,
        handleAddBlockOnEdge,
        isLastInPath: true,
        pathName: block.type === 'BEGIN' ? path.name : undefined,
        onPathsUpdate: handlePathsUpdate,
        onStrokeLinesUpdate: handleStrokeLinesUpdate,
        updateStrokeLineVisibility,
        strokeLinesVisible: visibility,
        hasSiblings,
        pathHasChildren,
        pathIsMerged,
      },
    });
    
    // Link blocks sequentially within a path
    if (index > 0) {
      edges.push({
        id: `edge-${path.blocks[index - 1].id}-${block.id}`,
        source: `block-${path.blocks[index - 1].id}`,
        target: nodeId,
        type: 'smoothstepCustom',
        sourceHandle: 'bottom',
        targetHandle: 'top',
        style: { stroke: '#b1b1b7' },
        animated: true,
        data: {
          blocks: path.blocks,
          handleAddBlockOnEdge,
          path: path,
        },
      });
    }

    // Sort child paths before processing them
    const sortedChildPaths = sortChildPaths(block.child_paths, allPaths);
    
    // Process each child path in the sorted order
    sortedChildPaths.forEach((childPathRelation) => {
      // Find the full path data from allPaths
      const fullChildPath = allPaths.find(p => p.id === childPathRelation.path.id);
      if (fullChildPath && fullChildPath.blocks.length > 0) {
        // Link parent blocks to the first block of child paths
        const parentBlocks = path.blocks
          .filter(b => fullChildPath.parent_blocks.some(pb => pb.block_id === b.id))
          .map(b => `block-${b.id}`);

        parentBlocks.forEach((parentBlockId) => {
          edges.push({
            id: `edge-${parentBlockId}-${fullChildPath.blocks[0].id}`,
            source: parentBlockId,
            target: `block-${fullChildPath.blocks[0].id}`,
            type: 'smoothstepCustomParent',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            style: { stroke: '#b1b1b7' },
            animated: true,
          });
        });
      }
      if (fullChildPath) {
        processPath(
          fullChildPath,
          nodes,
          edges,
          handleDeleteBlock,
          handleAddBlockOnEdge,
          visitedPaths,
          handlePathsUpdate,
          handleStrokeLinesUpdate,
          updateStrokeLineVisibility,
          strokeLineVisibilities,
          block.child_paths.length > 1
        );
      }
    });
  });
}