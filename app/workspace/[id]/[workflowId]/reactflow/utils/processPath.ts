import {
    Node,
    Edge,
  } from '@xyflow/react';
import { Path } from '../types';
// Recursive function to process paths into nodes and edges
export function processPath(
  path: Path,
  nodes: Node[],
  edges: Edge[],
  handleDeleteBlock: (blockId: string) => void,
  handleAddBlockOnEdge: (position: number,
    path: Path,
    event?: { clientX: number; clientY: number }) => void,
  visitedPaths = new Set<string>()
): void {
  if (visitedPaths.has(path.id.toString())) return; // Avoid infinite loops
  visitedPaths.add(path.id.toString());

  path.blocks.forEach((block, index) => {
    const nodeId = `block-${block.id}`;
    nodes.push({
      id: nodeId,
      type: block.type === 'BEGIN' 
        ? 'begin' 
        : block.type === 'END' 
          ? 'end' 
          : 'custom',
      position: { x: 0, y: 0 },
      data: {
        label: block.step_details || 'Block',
        position: block.position,
        type: block.type,
        onDelete: handleDeleteBlock,
        pathId: block.path_id,
        handleAddBlockOnEdge,
        isLastInPath: true,
        pathName: block.type === 'BEGIN' ? path.name : undefined,
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
      const childPath = childPathRelation.path;
      if (childPath.blocks.length > 0) {
        // Link parent blocks to the first block of child paths
        const parentBlocks = path.blocks
          .filter(b => childPath.parent_blocks.some(pb => pb.block_id === b.id))
          .map(b => `block-${b.id}`);

        parentBlocks.forEach((parentBlockId) => {
          edges.push({
            id: `edge-${parentBlockId}-${childPath.blocks[0].id}`,
            source: parentBlockId,
            target: `block-${childPath.blocks[0].id}`
          });
        });
      }
      processPath(childPath, nodes, edges, handleDeleteBlock, handleAddBlockOnEdge, visitedPaths); // Recurse to process child path
    });
  });
}