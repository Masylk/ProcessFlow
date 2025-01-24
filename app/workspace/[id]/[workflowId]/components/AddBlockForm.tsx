import React, { useState } from 'react';
import DelayForm from '@/app/workspace/[id]/[workflowId]/components/DelayForm';
import PathForm from '@/app/workspace/[id]/[workflowId]/components/PathForm';
import StepForm from '@/app/workspace/[id]/[workflowId]/components/StepForm';
import { Block, BlockType } from '@/types/block';

interface AddBlockFormProps {
  onSubmit: (blockData: any, path_id: number, position: number) => void;
  onCancel: () => void;
  initialPosition?: number;
  workflow_id?: number;
  path_id?: number;
  position?: number;
  savedBlock?: Block | null;
  chosenType?: BlockType;
}

const AddBlockForm: React.FC<AddBlockFormProps> = ({
  onSubmit,
  onCancel,
  initialPosition,
  workflow_id,
  path_id,
  position,
  savedBlock,
  chosenType = null,
}) => {
  const [selectedForm, setSelectedForm] = useState<BlockType | null>(
    chosenType
  );

  const renderForm = () => {
    switch (selectedForm) {
      case BlockType.DELAY:
        return (
          <DelayForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            initialPosition={initialPosition}
            workflow_id={workflow_id}
            path_id={path_id}
            position={position}
          />
        );
      case BlockType.PATH:
        return (
          <PathForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            initialPosition={initialPosition}
            workflow_id={workflow_id}
            path_id={path_id}
            position={position}
          />
        );
      case BlockType.STEP:
        return (
          <StepForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            initialPosition={initialPosition}
            workflow_id={workflow_id}
            path_id={path_id}
            position={position}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      {selectedForm ? (
        renderForm()
      ) : (
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedForm(BlockType.DELAY)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Delay
          </button>
          <button
            onClick={() => setSelectedForm(BlockType.PATH)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Path
          </button>
          <button
            onClick={() => setSelectedForm(BlockType.STEP)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Step
          </button>
        </div>
      )}
      {!selectedForm && (
        <div className="mt-4 flex space-x-4">
          {/* Add Paste Block button */}
          {path_id && position && (
            <button
              onClick={() =>
                savedBlock && onSubmit(savedBlock, path_id, position)
              }
              disabled={!savedBlock}
              className={`${
                savedBlock
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-400 text-gray-700'
              } px-4 py-2 rounded`}
            >
              Paste Block
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation(); // Stop propagation
              onCancel();
            }}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBlockForm;
