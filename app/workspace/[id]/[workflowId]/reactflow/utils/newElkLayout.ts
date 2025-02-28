// import prisma from "@/lib/prisma"; // Adjust path based on your setup
// import ELK from "elkjs";
// import {
//     Node,
//     Edge,
//   } from '@xyflow/react';
// import { Path } from "../types";

// // Recursive function to process paths into nodes and edges
// function processPath(
//   path: Path,
//   nodes: Node[],
//   edges: Edge[],
//   visitedPaths = new Set()
// ) {
//   if (visitedPaths.has(path.id)) return; // Avoid infinite loops
//   visitedPaths.add(path.id);

//   path.blocks.forEach((block, index) => {
//     const nodeId = `block-${block.id}`;
//     nodes.push({
//         id: nodeId,
//         type: 'custom',
//         position: { x: 0, y: 0 },
//         data: {
//           label: block.step_details || 'Block',
//           position: block.position,
//           type: block.type,
//           onDelete: handleDeleteBlock,
//           pathId: block.path_id,
//           handleAddBlockOnEdge,
//           isLastInPath: true,
//         },
//       });
//     // Link blocks sequentially within a path
//     if (index > 0) {
//       edges.push({ id: `edge-${path.blocks[index - 1].id}-${block.id}`, sources: [`block-${path.blocks[index - 1].id}`], targets: [nodeId] });
//     }

//     // Process each child path for the current block
//     block.child_paths.forEach((childPathRelation) => {
//       const childPath = childPathRelation.path;
//       if (childPath.blocks.length > 0) {
//         // Link parent blocks to the first block of child paths
//         const parentBlocks = path.blocks
//           .filter(b => childPath.parent_blocks.some(pb => pb.block_id === b.id))
//           .map(b => `block-${b.id}`);

//         parentBlocks.forEach((parentBlockId) => {
//           edges.push({ id: `edge-${parentBlockId}-${childPath.blocks[0].id}`, sources: [parentBlockId], targets: [`block-${childPath.blocks[0].id}`] });
//         });
//       }
//       processPath(childPath, nodes, edges, visitedPaths); // Recurse to process child path
//     });
//   });
// }

// // Function to compute ELK layout
// export async function computeElkLayout(workflowId: number) {
//   // Retrieve paths and blocks with child paths from Prisma
//   const paths = await prisma.path.findMany({
//     where: { workflow_id: workflowId },
//     include: {
//       blocks: {
//         include: { child_paths: { include: { path: true } } },
//       },
//       parent_blocks: true, // Needed to find root paths
//     },
//   });

//   // Find the root path (the one without parent blocks)
//   const rootPaths = paths.filter((p) => p.parent_blocks.length === 0);
//   const nodes = [];
//   const edges = [];

//   // Process each root path and generate nodes and edges
//   rootPaths.forEach((path) => processPath(path, nodes, edges));

//   // Compute the layout using ELK.js
//   const elk = new ELK();
//   const graph = {
//     id: "root",
//     layoutOptions: { "elk.algorithm": "layered" },
//     children: nodes,
//     edges: edges,
//   };

//   return await elk.layout(graph); // Return the layout object
// }



// const createNodesAndLayout = async () => {
//     // Sort blocks only by position, since they're all in the same path
//     const sortedBlocks = [...paths].sort((a, b) => a.position - b.position);

//     console.log(
//       'Sorted Blocks:',
//       sortedBlocks.map((b) => ({ id: b.id, position: b.position }))
//     );

//     const newNodes: Node[] = [];
//     const newEdges: Edge[] = [];

//     // Create nodes in sorted order
//     sortedBlocks.forEach((block) => {
//       const nodeId = `block-${block.id}`;
//       newNodes.push({
//         id: nodeId,
//         type: 'custom',
//         position: { x: 0, y: 0 },
//         data: {
//           label: block.step_block?.stepDetails || 'Block',
//           position: block.position,
//           type: block.type,
//           onDelete: handleDeleteBlock,
//           pathId: block.path_id,
//           handleAddBlockOnEdge,
//           isLastInPath: true,
//         },
//       });
//     });

//     // Create edges between consecutive blocks
//     for (let i = 0; i < sortedBlocks.length - 1; i++) {
//       const sourceId = `block-${sortedBlocks[i].id}`;
//       const targetId = `block-${sortedBlocks[i + 1].id}`;
//       const edgeId = `edge-${sortedBlocks[i].id}-${sortedBlocks[i + 1].id}`;

//       newEdges.push({
//         id: edgeId,
//         source: sourceId,
//         target: targetId,
//         type: 'smoothstepCustom',
//         sourceHandle: 'bottom',
//         targetHandle: 'top',
//         style: { stroke: '#b1b1b7' },
//         animated: true,
//         data: {
//           blocks: sortedBlocks,
//           handleAddBlockOnEdge,
//         },
//       });

//       // Update isLastInPath
//       const sourceNodeIndex = newNodes.findIndex((n) => n.id === sourceId);
//       if (sourceNodeIndex !== -1) {
//         newNodes[sourceNodeIndex].data.isLastInPath = false;
//       }
//     }

//     console.log('Before layout - Nodes:', newNodes);
//     console.log('Before layout - Edges:', newEdges);

//     const layoutedNodes = await createElkLayout(newNodes, newEdges);
//     console.log('After layout - Nodes:', layoutedNodes);

//     // Ensure nodes have positions
//     const nodesWithPositions = layoutedNodes.map((node) => {
//       if (
//         !node.position ||
//         (node.position.x === 0 && node.position.y === 0)
//       ) {
//         console.error('Node missing position:', node);
//       }
//       return node;
//     });

//     // Force a rerender with the new positions
//     setNodes([]);
//     setTimeout(() => {
//       setNodes(nodesWithPositions);
//       setEdges(newEdges);

//       // Fit view after a short delay to ensure nodes are rendered
//       if (isFirstRender.current) {
//         setTimeout(() => {
//           fitView({
//             padding: 0.5,
//             duration: 200,
//             minZoom: 0.5,
//             maxZoom: 1,
//           });
//           isFirstRender.current = false;
//         }, 200);
//       }
//     }, 50);
//   };

//   createNodesAndLayout();