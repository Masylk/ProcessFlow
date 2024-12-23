import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as necessary

const PathBlock: React.FC<{ block: Block }> = ({ block }) => (
  <div className="bg-blue-100 p-4 rounded shadow">
    <h3 className="text-blue-800 font-bold">Path Block</h3>
    <p>{block.title}</p>
    {block.description && <p>{block.description}</p>}
  </div>
);

export default PathBlock;
