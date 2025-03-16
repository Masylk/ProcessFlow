import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../types';

interface InvisibleNodeProps extends NodeProps {
  data: NodeData;
  id: string;
}

function InvisibleNode({ data }: InvisibleNodeProps) {
  return (
    
    <div className="w-full h-[120px] pointer-events-none" />
  );
}

export default InvisibleNode; 