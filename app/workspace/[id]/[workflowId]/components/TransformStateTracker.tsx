import React, { useEffect, useRef } from 'react';
import { useTransformEffect } from 'react-zoom-pan-pinch';

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
  const transformStateRef = useRef<any>({});

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
    if (focusRect) {
      // Calculate the center of the focusRect
      const centerX = focusRect.left + focusRect.width / 2;
      const centerY = focusRect.top + focusRect.height / 2;

      // Center the view based on focusRect dimensions
      const targetX = -centerX + window.innerWidth / 2;
      const targetY = -centerY + window.innerHeight / 2;

      // Set the transform using the current scale from transformState
      const currentScale = transformStateRef.current.scale || 1;
      setTransform(targetX, targetY, currentScale);
    }
  }, [focusRect, setTransform]);

  return null; // No visual rendering required
};

export default TransformStateTracker;
