import React from 'react';
import { Block } from '@/types/block';

const DelayBlock: React.FC<{ block: Block }> = ({ block }) => (
  <div className="bg-yellow-100 p-4 rounded shadow">
    <h3 className="text-yellow-800 font-bold">Delay Block</h3>
    <p>{block.title}</p>
    {block.description && <p>{block.description}</p>}
  </div>
);

export default DelayBlock;
