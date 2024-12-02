import React, { useEffect } from 'react';
import { useTransformEffect } from 'react-zoom-pan-pinch';

interface TransformStateTrackerProps {
  onTransformChange: (state: any) => void;
  zoomToElement: (
    node: HTMLElement | string,
    customScale?: number,
    animationTime?: number,
    animationType?:
      | 'easeOut'
      | 'linear'
      | 'easeInQuad'
      | 'easeOutQuad'
      | 'easeInOutQuad'
      | 'easeInCubic'
      | 'easeOutCubic'
      | 'easeInOutCubic'
      | 'easeInQuart'
      | 'easeOutQuart'
      | 'easeInOutQuart'
      | 'easeInQuint'
      | 'easeOutQuint'
      | 'easeInOutQuint'
  ) => void;
  focusId?: string | null;
}

const TransformStateTracker: React.FC<TransformStateTrackerProps> = ({
  onTransformChange,
  zoomToElement,
  focusId,
}) => {
  useTransformEffect(() => {
    focusId = null;
  });
  useEffect(() => {
    if (focusId) {
      const element = document.getElementById(focusId);
      if (element) {
        // Use the passed zoomToElement function
        zoomToElement(element, 1.2); // Adjust the scale factor as needed
      } else {
        console.warn(`Element with ID "${focusId}" not found.`);
      }
    }
  }, [focusId, zoomToElement]);

  return null; // No visual rendering required
};

export default TransformStateTracker;
