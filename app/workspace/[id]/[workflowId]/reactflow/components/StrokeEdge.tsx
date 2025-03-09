import React from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';

function StrokeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const isSelfLoop = data?.source === data?.target;
  const markerId = `stroke-arrow-${id}`;

  let edgePath = '';

  if (isSelfLoop) {
    // Create a self-loop path
    const radius = 40;
    const centerX = sourceX - radius;
    const centerY = sourceY + (targetY - sourceY) / 2;

    edgePath = `M ${sourceX} ${sourceY} 
                C ${centerX} ${sourceY} 
                  ${centerX} ${targetY} 
                  ${targetX} ${targetY}`;
  } else {
    // Use smooth step path for regular connections
    [edgePath] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth={12}
          markerHeight={12}
          refX={6}
          refY={6}
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 z"
            fill="#FF69A3"
            className="transition-colors duration-300"
          />
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#FF69A3',
          strokeDasharray: '5,5',
          markerEnd: `url(#${markerId})`,
        }}
      />
    </>
  );
}

export default StrokeEdge;
