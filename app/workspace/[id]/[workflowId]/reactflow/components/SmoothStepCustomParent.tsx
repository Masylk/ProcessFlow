import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

function SmoothStepCustomParent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#b1b1b7',
      }}
    />
  );
}

export default SmoothStepCustomParent; 