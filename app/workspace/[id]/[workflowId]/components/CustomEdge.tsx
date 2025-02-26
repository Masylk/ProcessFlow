import { EdgeProps, getBezierPath, Node } from '@xyflow/react';
import { useState, useCallback } from 'react';

interface CustomEdgeProps extends EdgeProps {
  handleAddBlock: (position: number) => void;
  selectedNodeId?: string | null;
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  handleAddBlock,
  source,
  target,
  selectedNodeId,
}: CustomEdgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const middleX = (sourceX + targetX) / 2;
  const middleY = (sourceY + targetY) / 2;

  const isConnectedToSelectedNode =
    selectedNodeId === source || selectedNodeId === target;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'all' }}
    >
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke={
          isConnectedToSelectedNode ? '#4e6bd7' : isHovered ? '#4e6bd7' : '#666'
        }
        fill="none"
        style={{ pointerEvents: 'all' }}
      />
      {isHovered && (
        <g
          transform={`translate(${middleX - 12} ${middleY - 12})`}
          onClick={() => {
            const position = parseInt(id.split('-')[2]);
            handleAddBlock(position);
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle r="12" fill="white" stroke="#4e6bd7" strokeWidth="2" />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#4e6bd7"
            fontSize="16"
            style={{ pointerEvents: 'none' }}
          >
            +
          </text>
        </g>
      )}
    </g>
  );
}
