import React, { useState, useCallback, CSSProperties, useRef, ReactNode, useEffect } from 'react';
import {
  EdgeProps as BaseEdgeProps,
  getSmoothStepPath,
  Edge,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  Position,
} from '@xyflow/react';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import DeleteStrokeEdgeModal from '../modals/DeleteStrokeEdgeModal';
import styles from './StrokeEdge.module.css';

interface StrokeEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label: string;
  preview?: boolean;
  isVisible?: boolean;
  onStrokeLinesUpdate?: (updateFn: (prev: any[]) => any[]) => void;
  controlPoints?: { x: number; y: number }[];
}

type EdgeProps = Omit<BaseEdgeProps, 'data'> & {
  data?: StrokeEdgeData;
};

interface Point {
  x: number;
  y: number;
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
}: EdgeProps): JSX.Element {
  const [showLabel, setShowLabel] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const [deleteButtonPosition, setDeleteButtonPosition] = useState({ x: 0, y: 0 });
  const [controlPoints, setControlPoints] = useState<Point[]>(
    data?.controlPoints || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [isHoveringControlPoint, setIsHoveringControlPoint] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const { isConnectMode, previewEdgeId } = useConnectModeStore();
  const zoom = useStore((state) => state.transform[2]);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const isSelfLoop = data?.source === data?.target;
  const markerId = `stroke-arrow-${id}`;

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (!isHoveringControlPoint) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        setLabelPosition(flowPosition);
        setDeleteButtonPosition(flowPosition);
        setShowLabel(true);
        setShowDeleteButton(true);
      }
    },
    [screenToFlowPosition, isHoveringControlPoint]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (showDeleteButton && !isHoveringControlPoint) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        setDeleteButtonPosition(flowPosition);
      }
    },
    [screenToFlowPosition, showDeleteButton, isHoveringControlPoint]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringControlPoint) {
        setShowLabel(false);
        setShowDeleteButton(false);
      }
    }, 400);
  }, [isHoveringControlPoint]);

  const handleControlPointMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHoveringControlPoint(true);
    setShowLabel(false);
    setShowDeleteButton(false);
  };

  const handleControlPointMouseLeave = () => {
    setIsHoveringControlPoint(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Extract the stroke line ID from the edge ID
      const strokeLineId = id.replace('stroke-edge-', '');
      
      // Call the API to delete the stroke line
      const response = await fetch(`/api/stroke-lines?id=${strokeLineId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete stroke line');
      }

      // Update the stroke lines in the parent component
      if (data?.onStrokeLinesUpdate) {
        const updateFn = (prev: any[]) => prev.filter(line => line.id.toString() !== strokeLineId);
        data.onStrokeLinesUpdate(updateFn);
      }
    } catch (error) {
      console.error('Error deleting stroke line:', error);
    }
    setShowDeleteModal(false);
  };

  const handleControlPointDragStart = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    setActivePointIndex(index);
  };

  // Helper function to get the midpoint between two points
  const getMidpoint = (x1: number, y1: number, x2: number, y2: number) => ({
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2
  });

  // Helper to determine if we should use vertical first layout
  const shouldUseVerticalLayout = useCallback(() => {
    const heightDiff = Math.abs(targetY - sourceY);
    const widthDiff = Math.abs(targetX - sourceX);
    return heightDiff > widthDiff;
  }, [sourceX, sourceY, targetX, targetY]);

  // Helper to update all control points based on a new layout
  const updateControlPointsForLayout = (
    isVertical: boolean,
    anchorPoint: { x: number; y: number },
    anchorIndex: number
  ) => {
    const points = [];
    
    if (anchorIndex === 1) {
      // Middle control point - allow free movement with smart constraints
      const x = anchorPoint.x;
      const y = anchorPoint.y;
      
      points.push(
        getMidpoint(sourceX, sourceY, x, sourceY),
        { x, y },
        getMidpoint(x, targetY, targetX, targetY)
      );
    } else if (anchorIndex === 0) {
      // First segment control point
      const x = anchorPoint.x;
      const y = sourceY;
      const midX = controlPoints[1]?.x ?? (sourceX + (targetX - sourceX) / 2);
      
      points.push(
        getMidpoint(sourceX, sourceY, x, y),
        { x: midX, y: controlPoints[1]?.y ?? sourceY },
        getMidpoint(midX, targetY, targetX, targetY)
      );
    } else {
      // Last segment control point
      const x = anchorPoint.x;
      const y = targetY;
      const midX = controlPoints[1]?.x ?? (sourceX + (targetX - sourceX) / 2);
      
      points.push(
        getMidpoint(sourceX, sourceY, midX, sourceY),
        { x: midX, y: controlPoints[1]?.y ?? targetY },
        getMidpoint(x, y, targetX, targetY)
      );
    }
    
    return points;
  };

  const handleControlPointDrag = useCallback(
    (event: MouseEvent) => {
      if (isDragging && activePointIndex !== null) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        setControlPoints((prev) => {
          const isVertical = shouldUseVerticalLayout();
          const newPoints = updateControlPointsForLayout(isVertical, flowPosition, activePointIndex);
          return newPoints;
        });
      }
    },
    [isDragging, activePointIndex, screenToFlowPosition, sourceX, sourceY, targetX, targetY, shouldUseVerticalLayout]
  );

  // Initialize control points
  useEffect(() => {
    const loadControlPoints = async () => {
      try {
        const strokeLineId = id.replace('stroke-edge-', '');
        const response = await fetch(`/api/stroke-lines?id=${strokeLineId}`);
        if (!response.ok) throw new Error('Failed to load stroke line data');
        
        const strokeLine = await response.json();
        
        if (strokeLine.controlPoints?.length === 3) {
          setControlPoints(strokeLine.controlPoints);
        } else {
          // Initialize with default middle point
          const midX = sourceX + (targetX - sourceX) / 2;
          const midY = sourceY + (targetY - sourceY) / 2;
          
          setControlPoints([
            getMidpoint(sourceX, sourceY, midX, sourceY),
            { x: midX, y: sourceY },
            getMidpoint(midX, targetY, targetX, targetY)
          ]);
        }
      } catch (error) {
        console.error('Error loading control points:', error);
        // Fall back to default initialization
        const midX = sourceX + (targetX - sourceX) / 2;
        setControlPoints([
          getMidpoint(sourceX, sourceY, midX, sourceY),
          { x: midX, y: sourceY },
          getMidpoint(midX, targetY, targetX, targetY)
        ]);
      }
    };

    loadControlPoints();
  }, [id, sourceX, sourceY, targetX, targetY]);

  // Save control points when they change
  const saveControlPoints = useCallback(async () => {
    try {
      // Extract the stroke line ID from the edge ID
      const strokeLineId = id.replace('stroke-edge-', '');
      
      // Update the stroke line with new control points
      const response = await fetch(`/api/stroke-lines?id=${strokeLineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          controlPoints,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save control points');
      }
    } catch (error) {
      console.error('Error saving control points:', error);
    }
  }, [id, controlPoints]);

  // Debounced save when control points change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (controlPoints.length > 0) {
        saveControlPoints();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [controlPoints, saveControlPoints]);

  const handleControlPointDragEnd = useCallback(() => {
    setIsDragging(false);
    setActivePointIndex(null);
    // Save immediately after drag ends
    saveControlPoints();
  }, [saveControlPoints]);

  // Add back the drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleControlPointDrag);
      window.addEventListener('mouseup', handleControlPointDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleControlPointDrag);
      window.removeEventListener('mouseup', handleControlPointDragEnd);
    };
  }, [isDragging, handleControlPointDrag, handleControlPointDragEnd]);

  let edgePath = '';

  if (isSelfLoop) {
    const radius = 40;
    const centerX = sourceX - radius;
    const centerY = sourceY + (targetY - sourceY) / 2;

    edgePath = `M ${sourceX} ${sourceY} 
                C ${centerX} ${sourceY} 
                  ${centerX} ${targetY} 
                  ${targetX} ${targetY}`;
  } else if (controlPoints.length === 3) {
    // Create path with three segments
    const [p1, p2, p3] = controlPoints;
    
    // Calculate the actual segment endpoints
    const firstSegmentEnd = {
      x: p1.x * 2 - sourceX,
      y: p1.y * 2 - sourceY
    };
    const secondSegmentEnd = {
      x: p2.x * 2 - firstSegmentEnd.x,
      y: p2.y * 2 - firstSegmentEnd.y
    };
    const thirdSegmentEnd = {
      x: p3.x * 2 - secondSegmentEnd.x,
      y: p3.y * 2 - secondSegmentEnd.y
    };

    edgePath = `M ${sourceX} ${sourceY}
                L ${firstSegmentEnd.x} ${firstSegmentEnd.y}
                L ${secondSegmentEnd.x} ${secondSegmentEnd.y}
                L ${thirdSegmentEnd.x} ${thirdSegmentEnd.y}
                L ${targetX} ${targetY}`;
  }

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 6 3 L 0 6 z"
            fill="#FF69A3"
            className="transition-colors duration-300"
          />
        </marker>
      </defs>
      {/* Visible stroke line */}
      <path
        id={id}
        className={`react-flow__edge-path stroke-edge-animated ${isDeleting ? 'opacity-0 transition-opacity duration-300' : ''}`}
        d={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#FF69A3',
          strokeDasharray: '5',
          opacity:
            isConnectMode && previewEdgeId !== id
              ? 0.4
              : isEditMode
                ? 0.4
                : data?.isVisible === false
                  ? 0
                  : 1,
          markerEnd: `url(#${markerId})`,
          pointerEvents: 'none',
        }}
      />
      {/* Wide hover detection path */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth="24"
        stroke="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: 'pointer',
          opacity: data?.isVisible === false ? 0 : 1,
          pointerEvents: data?.isVisible === false ? 'none' : 'stroke',
        }}
      />
      
      {/* Control Points */}
      {!isDeleting && data?.isVisible !== false && controlPoints.map((point, index) => (
        <EdgeLabelRenderer key={`control-${index}`}>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${point.x}px,${point.y}px) scale(${1 / zoom})`,
              pointerEvents: 'all',
              cursor: isDragging && activePointIndex === index ? 'grabbing' : 'grab',
              zIndex: 1000,
            }}
            onMouseDown={handleControlPointDragStart(index)}
            onMouseEnter={handleControlPointMouseEnter}
            onMouseLeave={handleControlPointMouseLeave}
          >
            <div
              className={`w-3 h-3 rounded-full bg-[#FF69A3] border-2 border-white shadow-md hover:scale-125 transition-transform duration-200 ${
                isDragging && activePointIndex === index ? 'scale-125' : ''
              } ${index === 1 ? 'bg-blue-500' : ''}`} // Middle point is blue
            />
          </div>
        </EdgeLabelRenderer>
      ))}

      {/* Delete button */}
      {showDeleteButton && !isDeleting && !isHoveringControlPoint && data?.isVisible !== false && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${deleteButtonPosition.x}px,${deleteButtonPosition.y}px) scale(${1 / zoom})`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
              }
              setShowDeleteButton(true);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="w-6 h-6 rounded-full bg-[#FF69A3] hover:bg-[#ff4d93] flex items-center justify-center shadow-md transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L11 11M1 11L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
     
      {showLabel && data?.label && !isHoveringControlPoint && data?.isVisible !== false && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px,${
                labelPosition.y - 25 / zoom
              }px) scale(${1 / zoom})`,
              pointerEvents: 'none',
              zIndex: 9999,
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

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteStrokeEdgeModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          label={data?.label?.toString()}
        />
      )}

      <style>
        {`
          @keyframes flowAnimation {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: 1000;
            }
          }
        `}
      </style>
    </>
  );
}

export default StrokeEdge;
