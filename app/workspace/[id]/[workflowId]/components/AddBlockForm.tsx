import React, { useState } from 'react';
import DelayForm from '@/app/workspace/[id]/[workflowId]/components/DelayForm';
import PathForm from '@/app/workspace/[id]/[workflowId]/components/PathForm';
import StepForm from '@/app/workspace/[id]/[workflowId]/components/StepForm';
import { Block } from '@/types/block';

interface AddBlockFormProps {
  onSubmit: (blockData: any, pathId: number, position: number) => void;
  onCancel: () => void;
  initialPosition: number;
  workflowId: number;
  pathId: number;
  position: number;
  savedBlock: Block | null;
}

const AddBlockForm: React.FC<AddBlockFormProps> = ({
  onSubmit,
  onCancel,
  initialPosition,
  workflowId,
  pathId,
  position,
  savedBlock,
}) => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const renderForm = () => {
    switch (selectedForm) {
      case 'Delay':
        return (
          <DelayForm
            onSubmit={onSubmit}
            onCancel={() => setSelectedForm(null)}
            initialPosition={initialPosition}
            workflowId={workflowId}
            pathId={pathId}
            position={position}
          />
        );
      case 'Path':
        return (
          <PathForm
            onSubmit={onSubmit}
            onCancel={() => setSelectedForm(null)}
            initialPosition={initialPosition}
            workflowId={workflowId}
            pathId={pathId}
            position={position}
          />
        );
      case 'Step':
        return (
          <StepForm
            onSubmit={onSubmit}
            onCancel={() => setSelectedForm(null)}
            initialPosition={initialPosition}
            workflowId={workflowId}
            pathId={pathId}
            position={position}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New Block</h2>
        {selectedForm ? (
          renderForm()
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedForm('Delay')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Delay
            </button>
            <button
              onClick={() => setSelectedForm('Path')}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Path
            </button>
            <button
              onClick={() => setSelectedForm('Step')}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Step
            </button>
          </div>
        )}
        {!selectedForm && (
          <div className="mt-4 flex space-x-4">
            {/* Add Paste Block button */}
            <button
              onClick={() =>
                savedBlock && onSubmit(savedBlock, pathId, position)
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
    </div>
  );
};

export default AddBlockForm;
