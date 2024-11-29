import React, { useEffect, useRef } from 'react';
import {
  ReactZoomPanPinchContextState,
  useTransformEffect,
} from 'react-zoom-pan-pinch';

interface TransformStateTrackerProps {
  onTransformChange: (state: any) => void;
  setTransform: (x: number, y: number, scale: number) => void;
  focusRect?: DOMRect | null;
}

const TransformStateTracker: React.FC<TransformStateTrackerProps> = ({
  onTransformChange,
  setTransform,
  focusRect,
}) => {
  // Create a local ref to store the transformState
  const transformStateRef = useRef<ReactZoomPanPinchContextState | null>(null);

  // Update the local transformState and notify parent whenever transform changes
  useTransformEffect((newState) => {
    transformStateRef.current = newState;

    console.log('state changing');
    // Trigger the onTransformChange callback with the updated state
    if (onTransformChange) {
      onTransformChange(newState);
    }
  });

  useEffect(() => {
    if (focusRect && transformStateRef.current) {
      const { state } = transformStateRef.current;
      const { positionX, positionY, scale } = state;

      // Log the current transform state
      console.log('Current Transform State:', {
        positionX,
        positionY,
        scale,
      });

      // Calculate the center of the block (focusRect) in its local (untransformed) coordinates
      const blockCenterX = focusRect.left + focusRect.width / 2;
      const blockCenterY = focusRect.top + focusRect.height / 2;

      // Transform the block center into the zoomed/panned coordinate space
      const transformedCenterX = blockCenterX * scale + positionX;
      const transformedCenterY = blockCenterY * scale + positionY;

      // Calculate the new position to center the block in the viewport
      const targetX = -transformedCenterX + window.innerWidth / 2;
      const targetY = -transformedCenterY + window.innerHeight / 2;

      // Log the target transform
      console.log('Target Transform:', {
        targetX,
        targetY,
        scale,
      });

      // Set the new transform
      setTransform(targetX, targetY, scale);
    }
  }, [focusRect, setTransform]);

  return null; // No visual rendering required
};

export default TransformStateTracker;
