import {
    Node,
    Edge,
  } from '@xyflow/react';
import { Path } from '../types';
import { BlockEndType } from '@/types/block';
// Recursive function to process paths into nodes and edges
export function processPath(
  path: Path,
  nodes: Node[],
  edges: Edge[],
  handleDeleteBlock: (blockId: string) => void,
  handleAddBlockOnEdge: (position: number,
    path: Path,
    event?: { clientX: number; clientY: number }) => void,
  allPaths: Path[],
  visitedPaths = new Set<string>(),
  handlePathsUpdate: (paths: Path[]) => void,
  handleStrokeLinesUpdate: (strokeLines: any[]) => void,
  updateStrokeLineVisibility: (blockId: number, isVisible: boolean) => void,
  strokeLineVisibilities: [number, boolean][],
  hasSiblings: boolean = false
): void {
  if (visitedPaths.has(path.id.toString())) return; // Avoid infinite loops
  visitedPaths.add(path.id.toString());

  path.blocks.forEach((block, index) => {
    const nodeId = `block-${block.id}`;
    const visibility = strokeLineVisibilities.find(([id]) => id === block.id)?.[1] ?? true;

    // Find end block and check for child paths
    const endBlock = path.blocks.find(block => 
      block.type === 'END' || block.type === 'LAST'
    );
    const pathHasChildren = endBlock?.child_paths && endBlock.child_paths.length > 0;

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

    // Process each child path for the current block
    block.child_paths.forEach((childPathRelation) => {
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
          allPaths,
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