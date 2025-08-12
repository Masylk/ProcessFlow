// import { Edge } from '@xyflow/react';
// import { createPortal } from 'react-dom';
// import StrokeEdge from './StrokeEdge';

// interface PreviewEdgePortalProps {
//   edge: Edge | null;
// }

// export const PreviewEdgePortal = ({ edge }: PreviewEdgePortalProps) => {
//   if (!edge) return null;

//   // Create a background edge with white stroke
//   const backgroundEdge: Edge = {
//     ...edge,
//     style: {
//       ...edge.style,
//       stroke: 'white',
//       strokeWidth: (edge.style?.strokeWidth as number || 3) + 4, // Wider than the main stroke
//       opacity: 1,
//     },
//   };

//   return createPortal(
//     <svg
//       style={{
//         position: 'fixed',
//         inset: 0,
//         pointerEvents: 'none',
//         zIndex: 9999,
//       }}
//     >
//       <StrokeEdge {...backgroundEdge} /> {/* Render white background stroke first */}
//       <StrokeEdge {...edge} /> {/* Render colored stroke on top */}
//     </svg>,
//     document.body
//   );
// }; 