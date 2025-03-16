import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useConnectModeStore } from '../../store/connectModeStore';

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

  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#b1b1b7',
      }}
      className={`transition-opacity duration-300 ${isConnectMode ? 'opacity-40' : ''}`}
    />
  );
}

export default SmoothStepCustomParent;
