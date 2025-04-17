import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import { BasicBlock } from './BasicBlock';

interface InvisibleNodeProps extends NodeProps {
  data: NodeData;
  id: string;
}

function InvisibleNode(props: NodeProps & { data: NodeData }) {
  return (
    <BasicBlock {...props}>
      <div className="w-full h-[120px] pointer-events-none" />
    </BasicBlock>
  );
}

export default InvisibleNode;
