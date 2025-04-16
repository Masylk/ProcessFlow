import React from 'react';
import { NodeProps } from '@xyflow/react';
import { useIsModalOpenStore } from '@/app/isModalOpenStore';

/**
 * BasicNode wraps all node components to provide shared logic,
 * such as disabling interaction when a modal is open.
 */
export type BasicNodeProps = NodeProps & {
  children: React.ReactNode;
};

export function BasicNode({ children }: BasicNodeProps) {
  const isModalOpen = useIsModalOpenStore((state: any) => state.isModalOpen);

  return (
    <div
      className={isModalOpen ? 'pointer-events-none' : ''}
      tabIndex={-1}
      aria-disabled={isModalOpen}
    >
      {children}
    </div>
  );
}
