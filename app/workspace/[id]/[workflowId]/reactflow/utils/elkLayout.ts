import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { CSSProperties } from 'react';

const elk = new ELK();

export async function createElkLayout(nodes: Node[], edges: Edge[]) {
  console.log('Creating layout for nodes:', nodes);
  console.log('Creating layout for edges:', edges);

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
  console.log('Edges:', edges);
  console.log('Nodes ids:', nodeIds);
  console.log('Valid edges:', validEdges);

  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: 481,
    height: 120,
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

  console.log('ELK Graph:', elkGraph);

  const layoutOptions = {
    'elk.algorithm': 'mrtree',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '100',
    'elk.spacing.componentComponent': '600',
    'elk.nodeSize.constraints': 'MINIMUM_SIZE',
    'elk.nodeSize.minimum': '481',
    'elk.spacing.nodeNodeBetweenLayers': '100',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.padding': '[top=50,left=200,bottom=50,right=200]',
    'elk.interactive': 'true',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    'elk.spacing.individual': '100',
    'elk.spacing.base': '150',
  };

  try {
    const layout = await elk.layout(elkGraph, { layoutOptions });
    console.log('ELK Layout result:', layout);

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