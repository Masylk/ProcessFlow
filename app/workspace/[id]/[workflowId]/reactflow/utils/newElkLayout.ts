// import { prisma } from "@/lib/prisma"; // Adjust path based on your setup
// import ELK from "elkjs";

// // Recursive function to process paths into nodes and edges
// function processPath(
//   path,
//   nodes,
//   edges,
//   visitedPaths = new Set()
// ) {
//   if (visitedPaths.has(path.id)) return; // Avoid infinite loops
//   visitedPaths.add(path.id);

//   path.blocks.forEach((block, index) => {
//     const nodeId = `block-${block.id}`;
//     nodes.push({ id: nodeId, width: 150, height: 100, label: block.title || "Block" });

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
