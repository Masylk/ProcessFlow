import React, { useState, useEffect } from 'react';
import { Block, BlockType } from '@/types/block';

interface BlockDetailsSidebarProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (updatedBlock: Block) => void;
  onDelete: (blockId: number) => void;
}

export default function BlockDetailsSidebar({
  block,
  onClose,
  onUpdate,
  onDelete,
}: BlockDetailsSidebarProps) {
  const [newType, setNewType] = useState<Block['type']>(
    block?.type || BlockType.STEP
  );
  const [newDescription, setNewDescription] = useState(
    block?.description || ''
  );

  useEffect(() => {
    if (block) {
      setNewType(block.type);
      setNewDescription(block.description || '');
    }
  }, [block]);

  const handleUpdate = () => {
    if (block) {
      const updatedBlock: Block = {
        ...block,
        type: newType as Block['type'],
        description: newDescription,
      };
      onUpdate(updatedBlock);
      onClose(); // Close the component after updating
    }
  };

  const handleDelete = () => {
    if (block) {
      onDelete(block.id);
      onClose(); // Close the component after deleting
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 bg-gray-100 p-4 w-64 border-l z-40">
      {block ? (
        <>
          <button onClick={onClose} className="text-red-500 mb-4">
            Close
          </button>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Block['type'])}
              className="border rounded p-1 w-full"
            >
              <option value="DELAY">DELAY</option>
              <option value="STEP">STEP</option>
              <option value="PATH">PATH</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border rounded p-1 w-full"
            />
          </div>
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white py-2 px-4 rounded"
          >
            Delete
          </button>
        </>
      ) : (
        <p>Select a block to see details</p>
      )}
    </div>
  );
}
