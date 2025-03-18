import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { CSSProperties } from 'react';
import { BlockEndType } from '@/types/block';

const elk = new ELK();

export async function createElkLayout(nodes: Node[], edges: Edge[]) {

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  const isEndTypeNode = (type: string | undefined) => 
    type && Object.values(BlockEndType).map(t => t.toLowerCase()).includes(type);

  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: node.type === 'begin' ? 200 : 
          node.type === 'last' ? 32 :
          node.type === 'path' ? 32 :
          node.type === 'end' ? 290 :
          node.type === 'merge' ? 12 :
          481,
    height: node.type === 'begin' ? 50 : 
           node.type === 'last' ? 32 :
           node.type === 'path' ? 32 :
           node.type === 'end' ? 48 :
           node.type === 'merge' ? 12 :
           120,
  }));

  const elkEdges = validEdges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const elkGraph = {
    id: 'root',
    children: elkNodes,
    edges: elkEdges,
  };

  const layoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '100',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.componentComponent': '100',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.spacing.edgeNodeBetweenLayers': '50',
    'elk.layered.mergeEdges': 'true',
    'elk.layered.priority.direction': '1',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.alignment': 'CENTER',
    'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    'elk.layered.crossingMinimization.semiInteractive': 'true',
    'elk.layered.spacing.baseValue': '80',
    'elk.separateConnectedComponents': 'true',
    'elk.spacing': '80',
    'elk.layered.layering.wideNodesOnMultipleLayers': 'OFF',
    'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
    'elk.layered.nodePlacement.favorStraightEdges': 'true',
    'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
  };

  try {
    const layout = await elk.layout(elkGraph, { layoutOptions });

    if (!layout || !layout.children) {
      console.error('Invalid layout result:', layout);
      return nodes;
    }

    return nodes.map((node) => {
      const elkNode = layout.children?.find((n) => n.id === node.id);
      if (!elkNode || elkNode.x === undefined || elkNode.y === undefined) {
        console.error('Missing layout for node:', node.id);
        return node;
      }

      return {
        ...node,
        position: {
          x: elkNode.x,
          y: elkNode.y,
        },
        style: {
          ...node.style,
          zIndex: 1,
          visibility: 'visible' as CSSProperties['visibility'],
          opacity: 1,
        },
      } as Node;
    });
  } catch (error) {
    console.error('Error calculating layout:', error);
    return nodes;
  }
} 