import { Block, BlockType } from '@/types/block';
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
  selectedBlock?: Block | null;
}

const TransformStateTracker: React.FC<TransformStateTrackerProps> = ({
  onTransformChange,
  zoomToElement,
  focusId,
  selectedBlock,
}) => {
  useTransformEffect(() => {
    focusId = null;
  });

  useEffect(() => {
    if (focusId) {
      const element = document.getElementById(focusId);
      if (element) {
        zoomToElement(element, 1.2); // Adjust the scale factor as needed
      } else {
        console.warn(`Element with ID "${focusId}" not found.`);
      }
    } else if (selectedBlock && selectedBlock.type === BlockType.STEP) {
      const originalElement = document.getElementById(
        `block:${selectedBlock.id}`
      );
      if (originalElement && originalElement.parentElement) {
        // Create a copy of the element
        const copyElement = originalElement.cloneNode(true) as HTMLElement;

        // Style the copy element
        copyElement.style.position = 'absolute';
        copyElement.style.opacity = '0';
        copyElement.style.left = `${originalElement.offsetLeft + 250}px`; // Offset by 50px to the left
        copyElement.style.top = `${originalElement.offsetTop + 50}px`;
        copyElement.style.zIndex = '-10';
        copyElement.style.pointerEvents = 'none'; // Ensure it doesn't interfere with interactions

        // Append the copy to the parent of the original element
        originalElement.parentElement.appendChild(copyElement);

        // Use the passed zoomToElement function
        zoomToElement(copyElement, 1.2); // Adjust the scale factor as needed

        // Clean up the copy after zooming
        setTimeout(() => {
          originalElement.parentElement?.removeChild(copyElement);
        }, 1000); // Adjust timing based on animation duration
      } else {
        console.warn(
          `Element with ID "block:${selectedBlock.id}" not found or has no parent.`
        );
      }
    }
  }, [focusId, zoomToElement, selectedBlock]);

  return null; // No visual rendering required
};

export default TransformStateTracker;
