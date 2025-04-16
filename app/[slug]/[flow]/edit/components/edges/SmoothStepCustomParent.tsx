import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { BasicEdge } from './BasicEdge';

function SmoothStepCustomParent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  id,
  source,
  target,
  data,
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
  const isEditMode = useEditModeStore((state) => state.isEditMode);

  return (
    <BasicEdge
      id={id}
      source={source}
      target={target}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      style={style}
      data={data}
    >
      <path
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: '#b1b1b7',
        }}
        className={`${isConnectMode || isEditMode ? 'opacity-40' : ''}`}
      />
    </BasicEdge>
  );
}

export default SmoothStepCustomParent;
