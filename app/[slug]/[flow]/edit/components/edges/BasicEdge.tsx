import React from 'react';
import { EdgeProps } from '@xyflow/react';
import { useIsModalOpenStore } from '@/app/isModalOpenStore';

/**
 * BasicEdge wraps all edge components to provide shared logic,
 * such as disabling interaction when a modal is open.
 */
export type BasicEdgeProps = EdgeProps & {
  children: React.ReactNode;
};

export function BasicEdge({ children }: BasicEdgeProps) {
  const isModalOpen = useIsModalOpenStore((state: any) => state.isModalOpen);

  return (
    <g
      className={isModalOpen ? 'pointer-events-none' : ''}
      aria-disabled={isModalOpen}
    >
      {children}
    </g>
  );
}
