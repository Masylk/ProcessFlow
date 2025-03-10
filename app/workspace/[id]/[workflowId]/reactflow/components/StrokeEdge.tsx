import React, { useState, useCallback, CSSProperties } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  Edge,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react';

interface StrokeEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label: string;
  preview?: boolean;
}

function getPointOnLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return { x: x1, y: y1 };

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
  );

  return {
    x: x1 + t * dx,
    y: y1 + t * dy,
  };
}

function StrokeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {} as CSSProperties,
  data,
}: EdgeProps) {
  const [showLabel, setShowLabel] = useState(false);
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  const isSelfLoop = data?.source === data?.target;
  const markerId = `stroke-arrow-${id}`;

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      console.log('Edge hover detected');
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setLabelPosition(flowPosition);
      setShowLabel(true);
    },
    [screenToFlowPosition]
  );

  let edgePath = '';

  if (isSelfLoop) {
    const radius = 40;
    const centerX = sourceX - radius;
    const centerY = sourceY + (targetY - sourceY) / 2;

    edgePath = `M ${sourceX} ${sourceY} 
                C ${centerX} ${sourceY} 
                  ${centerX} ${targetY} 
                  ${targetX} ${targetY}`;
  } else {
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
          strokeDasharray: '10,5',
          markerEnd: `url(#${markerId})`,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth="20"
        stroke="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          console.log('Edge hover ended');
          setShowLabel(false);
        }}
        style={{ cursor: 'pointer' }}
      />
      {showLabel && (
        <circle
          cx={labelPosition.x}
          cy={labelPosition.y}
          r={4}
          fill="red"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {showLabel && data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px,${labelPosition.y}px)`,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            <div
              className="px-3 py-1 bg-white rounded shadow-md text-sm border"
              style={{
                color: '#C11574',
                borderColor: '#F670C7',
                backgroundColor: '#FFFFFF',
              }}
            >
              {data?.label?.toString()}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default StrokeEdge;
