import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { CSSProperties } from 'react';
import { BlockEndType } from '@/types/block';
import { Block } from '@/types/block';
import { NodeData } from '../../types';

const elk = new ELK();

export async function createElkLayout(nodes: Node[], edges: Edge[]) {

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  const isEndTypeNode = (type: string | undefined) => 
    type && Object.values(BlockEndType).map(t => t.toLowerCase()).includes(type);

  console.log(nodes.map((node) => (node.data as NodeData)?.path?.parent_blocks?.length))
  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: node.type === 'begin' ? 
            (((node.data as NodeData)?.path?.parent_blocks?.length ?? 0) > 1 ? 12 : (((node.data as NodeData)?.path?.parent_blocks?.length ?? 0) > 0 ? 200 : 350)) :
            node.type === 'last' ? 32 :
            node.type === 'path' ? 32 :
            node.type === 'end' ? 290 :
            node.type === 'merge' ? 12 :
            node.type === 'eventDelay' ? 531 :
            node.type === 'fixedDelay' ? 382 :
            481,
    height: node.type === 'begin' ? 
             (((node.data as NodeData)?.path?.parent_blocks?.length ?? 0) > 1 ? 12 : 50) :
             node.type === 'last' ? 32 :
             node.type === 'path' ? 32 :
             node.type === 'end' ? 48 :
             node.type === 'merge' ? 12 :
             node.type === 'eventDelay' ? 223 :
             node.type === 'fixedDelay' ? 132 :
             ((node.data as NodeData)?.block as Block)?.image ? 387 : 120,
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
    'elk.spacing.nodeNode': '80',
    'elk.layered.spacing.nodeNodeBetweenLayers': '120',
    'elk.spacing.componentComponent': '80',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.spacing.edgeNodeBetweenLayers': '80',
    'elk.layered.mergeEdges': 'true',
    'elk.layered.priority.direction': '1',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.alignment': 'CENTER',
    'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    'elk.layered.crossingMinimization.semiInteractive': 'true',
    'elk.layered.spacing.baseValue': '80',
    'elk.separateConnectedComponents': 'true',
    'elk.layered.layering.wideNodesOnMultipleLayers': 'OFF',
    'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
    'elk.layered.nodePlacement.favorStraightEdges': 'true',
    'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
    'elk.edges.routing': 'ORTHOGONAL',
    'elk.spacing.edgeEdge': '50',
    'elk.spacing.edgeNode': '50',
    'elk.edge.thickness': '2',
    'elk.edges.bendPoints': 'true',
    'elk.edges.sourcePoint': 'FREE',
    'elk.edges.targetPoint': 'FREE',
    'elk.portAlignment.default': 'CENTER',
    'elk.portConstraints': 'FREE',
    'elk.layered.feedbackEdges': 'true',
    'elk.layered.spacing.edgeEdgeBetweenLayers': '50',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
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