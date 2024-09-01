import React from 'react';
import { PathOptionBlock } from '@/types/block'; // Import the PathOptionBlock type
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';

interface PathBlockProps {
  relatedBlocks: PathOptionBlock[]; // Use PathOptionBlock instead of Block
  onAddRelatedBlock: (pathOptionId: number, blockId: number) => void;
  pathOptionId: number;
}

const PathBlock: React.FC<PathBlockProps> = ({
  relatedBlocks,
  onAddRelatedBlock,
  pathOptionId,
}) => {
  return (
    <div>
      <h4>Related Blocks:</h4>
      <div className="flex flex-wrap gap-2">
        {relatedBlocks.map((block) => (
          <div key={block.id} className="flex flex-col items-start">
            <EditorBlock
              block={block.block}
              onClick={() => {
                console.log('related block list click');
              }}
            />
            <AddBlock
              id={block.blockId}
              onAdd={() => onAddRelatedBlock(pathOptionId, block.blockId)}
              label="Add Block"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathBlock;
