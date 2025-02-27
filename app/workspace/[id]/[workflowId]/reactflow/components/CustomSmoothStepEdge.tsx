import React from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { EdgeData } from '../types';

function CustomSmoothStepEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data: EdgeData }) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 16,
  });

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sourceBlockId = source.replace('block-', '');
    const targetBlockId = target.replace('block-', '');

    const sourceBlock = data.blocks.find((b) => b.id === Number(sourceBlockId));
    const targetBlock = data.blocks.find((b) => b.id === Number(targetBlockId));

    if (sourceBlock && targetBlock) {
      const position = Math.ceil((sourceBlock.position + targetBlock.position) / 2);
      data.handleAddBlockOnEdge?.(position, data.path, e);
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#b1b1b7',
          ...style,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth="20"
        stroke="transparent"
        onClick={handleEdgeClick}
        style={{ cursor: 'pointer' }}
      />
      <foreignObject
        width={40}
        height={40}
        x={(sourceX + targetX) / 2 - 20}
        y={(sourceY + targetY) / 2 - 20}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <button
            onClick={handleEdgeClick}
            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center text-xl"
          >
            +
          </button>
        </div>
      </foreignObject>
    </>
  );
}

export default CustomSmoothStepEdge;
