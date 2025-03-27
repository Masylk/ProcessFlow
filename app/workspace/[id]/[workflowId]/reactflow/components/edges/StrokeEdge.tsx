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
import { updateStrokeLineControlPoints } from '../../utils/stroke-lines';

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

// Helper function to calculate distance between two points
const getDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Helper function to clamp a value between min and max
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

// Helper function to determine if a point is near another point
const isNearPoint = (p1: Point, p2: Point, threshold = 20) => {
  return getDistance(p1, p2) < threshold;
};

// Helper function to snap a point to the nearest grid position
const snapToGrid = (point: Point, gridSize = 20) => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

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
  const [controlPoints, setControlPoints] = useState<Point[]>([]);
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

  const handleControlPointMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHoveringControlPoint(true);
    setShowLabel(false);
    setShowDeleteButton(false);
  }, []);

  const handleControlPointMouseLeave = useCallback(() => {
    setIsHoveringControlPoint(false);
  }, []);

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

  // Helper function to get the handle position
  const getHandlePosition = useCallback((position: Position | undefined, isSource: boolean) => {
    if (!position) return isSource ? 'left' : 'right';
    return position.toLowerCase();
  }, []);

  // Get actual connection points based on handle positions
  const getConnectionPoint = useCallback((x: number, y: number, position: Position | undefined, isSource: boolean) => {
    const handlePos = getHandlePosition(position, isSource);
    const offset = 12; // Handle offset from node edge

    switch (handlePos) {
      case 'left':
        return { x: x - offset, y };
      case 'right':
        return { x: x + offset, y };
      case 'top':
        return { x, y: y - offset };
      case 'bottom':
        return { x, y: y + offset };
      default:
        return { x, y };
    }
  }, [getHandlePosition]);

  const handleControlPointDrag = useCallback(
    (event: MouseEvent) => {
      if (isDragging && activePointIndex !== null) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const source = getConnectionPoint(sourceX, sourceY, sourcePosition, true);
        const target = getConnectionPoint(targetX, targetY, targetPosition, false);
        
        // Calculate the total path length for constraints
        const pathLength = getDistance(source, target);
        const maxOffset = Math.min(pathLength * 0.4, 120); // Reduced max offset for better control
        
        setControlPoints((prev) => {
          const newPoints = [...prev];
          const point = newPoints[activePointIndex];
          
          // Snap to grid for more precise control
          const snappedPosition = snapToGrid(flowPosition);
          
          // For a three-point path, middle point moves with enhanced constraints
          if (newPoints.length === 3 && activePointIndex === 1) {
            // Determine primary direction based on source and target positions
            const isHorizontalPrimary = Math.abs(target.x - source.x) > Math.abs(target.y - source.y);
            
            if (isHorizontalPrimary) {
              // Keep middle point centered horizontally
              const midX = source.x + (target.x - source.x) / 2;
              const minY = Math.min(source.y, target.y) - maxOffset;
              const maxY = Math.max(source.y, target.y) + maxOffset;
              
              // Snap to source or target Y if near
              if (isNearPoint({ x: midX, y: snappedPosition.y }, { x: midX, y: source.y })) {
                point.y = source.y;
              } else if (isNearPoint({ x: midX, y: snappedPosition.y }, { x: midX, y: target.y })) {
                point.y = target.y;
              } else {
                point.y = clamp(snappedPosition.y, minY, maxY);
              }
              point.x = midX;
              
              // Update adjacent points
              newPoints[0].x = source.x;
              newPoints[0].y = point.y;
              newPoints[2].x = target.x;
              newPoints[2].y = point.y;
            } else {
              // Keep middle point centered vertically
              const midY = source.y + (target.y - source.y) / 2;
              const minX = Math.min(source.x, target.x) - maxOffset;
              const maxX = Math.max(source.x, target.x) + maxOffset;
              
              // Snap to source or target X if near
              if (isNearPoint({ x: snappedPosition.x, y: midY }, { x: source.x, y: midY })) {
                point.x = source.x;
              } else if (isNearPoint({ x: snappedPosition.x, y: midY }, { x: target.x, y: midY })) {
                point.x = target.x;
              } else {
                point.x = clamp(snappedPosition.x, minX, maxX);
              }
              point.y = midY;
              
              // Update adjacent points
              newPoints[0].x = point.x;
              newPoints[0].y = source.y;
              newPoints[2].x = point.x;
              newPoints[2].y = target.y;
            }
          } else {
            // For end points, enhance constraints and add snapping
            const isSource = activePointIndex === 0;
            const handlePosition = isSource ? sourcePosition : targetPosition;
            const anchorPoint = isSource ? source : target;
            const otherPoint = newPoints[isSource ? 1 : newPoints.length - 2];
            
            if (handlePosition === Position.Left || handlePosition === Position.Right) {
              const minY = Math.min(source.y, target.y) - maxOffset;
              const maxY = Math.max(source.y, target.y) + maxOffset;
              
              // Snap to source, target, or other control point Y if near
              if (isNearPoint({ x: anchorPoint.x, y: snappedPosition.y }, { x: anchorPoint.x, y: source.y })) {
                point.y = source.y;
              } else if (isNearPoint({ x: anchorPoint.x, y: snappedPosition.y }, { x: anchorPoint.x, y: target.y })) {
                point.y = target.y;
              } else {
                point.y = clamp(snappedPosition.y, minY, maxY);
              }
              point.x = anchorPoint.x;
              otherPoint.y = point.y;
            } else {
              const minX = Math.min(source.x, target.x) - maxOffset;
              const maxX = Math.max(source.x, target.x) + maxOffset;
              
              // Snap to source, target, or other control point X if near
              if (isNearPoint({ x: snappedPosition.x, y: anchorPoint.y }, { x: source.x, y: anchorPoint.y })) {
                point.x = source.x;
              } else if (isNearPoint({ x: snappedPosition.x, y: anchorPoint.y }, { x: target.x, y: anchorPoint.y })) {
                point.x = target.x;
              } else {
                point.x = clamp(snappedPosition.x, minX, maxX);
              }
              point.y = anchorPoint.y;
              otherPoint.x = point.x;
            }
          }
          
          return newPoints;
        });
      }
    },
    [isDragging, activePointIndex, screenToFlowPosition, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, getConnectionPoint]
  );

  // Save control points when they change
  const saveControlPoints = useCallback(async () => {
    try {
      const strokeLineId = parseInt(id.replace('stroke-edge-', ''));
      const result = await updateStrokeLineControlPoints(strokeLineId, controlPoints);
      
      if (!result) {
        throw new Error('Failed to save control points');
      }
    } catch (error) {
      console.error('Error saving control points:', error);
    }
  }, [id, controlPoints]);

  useEffect(() => {
    const loadControlPoints = async () => {
      try {
        const strokeLineId = id.replace('stroke-edge-', '');
        const response = await fetch(`/api/stroke-lines?id=${strokeLineId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load stroke line data');
        }

        const strokeLine = await response.json();
        const source = getConnectionPoint(sourceX, sourceY, sourcePosition, true);
        const target = getConnectionPoint(targetX, targetY, targetPosition, false);

        if (strokeLine.control_points && Array.isArray(strokeLine.control_points) && strokeLine.control_points.length > 0) {
          setControlPoints(strokeLine.control_points);
        } else {
          // Initialize with three points in the most logical direction
          const isHorizontal = Math.abs(target.x - source.x) > Math.abs(target.y - source.y);
          
          if (isHorizontal) {
            const midX = source.x + (target.x - source.x) / 2;
            const midY = source.y + (target.y - source.y) / 2;
            
            // If nodes are very close vertically, add a small offset
            const offset = Math.abs(target.y - source.y) < 50 ? 25 : 0;
            const y = midY + (offset * (midY > source.y ? 1 : -1));
            
            const initialPoints = [
              { x: source.x, y },
              { x: midX, y },
              { x: target.x, y }
            ];
            setControlPoints(initialPoints);
            
            // Save initial points to database
            await updateStrokeLineControlPoints(parseInt(strokeLineId), initialPoints);
          } else {
            const midX = source.x + (target.x - source.x) / 2;
            const midY = source.y + (target.y - source.y) / 2;
            
            // If nodes are very close horizontally, add a small offset
            const offset = Math.abs(target.x - source.x) < 50 ? 25 : 0;
            const x = midX + (offset * (midX > source.x ? 1 : -1));
            
            const initialPoints = [
              { x, y: source.y },
              { x, y: midY },
              { x, y: target.y }
            ];
            setControlPoints(initialPoints);
            
            // Save initial points to database
            await updateStrokeLineControlPoints(parseInt(strokeLineId), initialPoints);
          }
        }
      } catch (error) {
        console.error('Error loading control points:', error);
        // Simple fallback
        const source = getConnectionPoint(sourceX, sourceY, sourcePosition, true);
        const target = getConnectionPoint(targetX, targetY, targetPosition, false);
        const midX = source.x + (target.x - source.x) / 2;
        const midY = source.y + (target.y - source.y) / 2;
        
        const fallbackPoints = [
          { x: source.x, y: midY },
          { x: midX, y: midY },
          { x: target.x, y: midY }
        ];
        setControlPoints(fallbackPoints);
        
        // Save fallback points to database
        try {
          const strokeLineId = parseInt(id.replace('stroke-edge-', ''));
          await updateStrokeLineControlPoints(strokeLineId, fallbackPoints);
        } catch (saveError) {
          console.error('Error saving fallback control points:', saveError);
        }
      }
    };

    loadControlPoints();
  }, [id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, getConnectionPoint]);

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
  } else if (controlPoints.length > 0) {
    // Get actual source and target points
    const source = getConnectionPoint(sourceX, sourceY, sourcePosition, true);
    const target = getConnectionPoint(targetX, targetY, targetPosition, false);

    // Create orthogonal path starting from source handle
    edgePath = `M ${source.x} ${source.y}`;
    
    // Add all control points
    for (const point of controlPoints) {
      edgePath += ` L ${point.x} ${point.y}`;
    }
    
    // End at target handle
    edgePath += ` L ${target.x} ${target.y}`;
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
