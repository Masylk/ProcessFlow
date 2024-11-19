import { TransformState } from '@/types/transformstate';
import React from 'react';
import { useTransformEffect } from 'react-zoom-pan-pinch';

interface TransformStateTrackerProps {
  onTransformChange: (state: TransformState) => void;
}

const TransformStateTracker: React.FC<TransformStateTrackerProps> = ({
  onTransformChange,
}) => {
  useTransformEffect(({ state }) => {
    const transformState: TransformState = {
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY,
    };

    // Notify parent or log state changes
    onTransformChange(transformState);
  });

  return null; // This component only tracks state and doesn't render anything
};

export default TransformStateTracker;
