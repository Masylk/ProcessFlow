import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import { BasicBlock } from './BasicBlock';

interface InvisibleBlockProps extends NodeProps {
  data: NodeData;
  id: string;
}

function InvisibleBlock(props: NodeProps & { data: NodeData }) {
  return (
    <BasicBlock {...props}>
      <div className="w-full h-[120px] pointer-events-none" />
    </BasicBlock>
  );
}

export default InvisibleBlock;
