import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/app/components/Modal';

interface AddChildPathModalProps {
  onClose: () => void;
  onConfirm: (pathNames: string[]) => void;
  existingPathsCount: number;
}

const AddChildPathModal: React.FC<AddChildPathModalProps> = ({
  onClose,
  onConfirm,
  existingPathsCount = 0,
}) => {
  const [pathNames, setPathNames] = useState<string[]>([
    `Path n°${existingPathsCount + 1}`,
    `Path n°${existingPathsCount + 2}`,
  ]);

  // Check if any path name is empty
  const hasEmptyPath = pathNames.some((name) => name.trim() === '');

  const handleAddPath = () => {
    const nextPathNumber = existingPathsCount + pathNames.length + 1;
    setPathNames([...pathNames, `Path n°${nextPathNumber}`]);
  };

  const modalContent = (
    <Modal
      title="Add Child Paths"
      onClose={onClose}
      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
      actions={
        <>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(pathNames)}
            disabled={hasEmptyPath}
            className={`px-6 py-2 text-sm text-white rounded transition-colors duration-200 ${
              hasEmptyPath
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Create paths
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 max-h-[240px] overflow-y-auto">
            {pathNames.map((name, index) => (
              <div key={index} className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Path n°{existingPathsCount + index + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...pathNames];
                    newNames[index] = e.target.value;
                    setPathNames(newNames);
                  }}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder={`This is your path n°${existingPathsCount + index + 1}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleAddPath}
            className="w-full py-2 text-sm text-blue-500 hover:bg-blue-100 border border-blue-500 rounded transition-colors duration-200"
          >
            Add new path
          </button>
        </div>
      </div>
    </Modal>
  );

  // Only render if we're in a browser environment
  if (typeof window === 'undefined') return null;

  // Create a portal to render the modal at the root level
  return createPortal(modalContent, document.body);
};

export default AddChildPathModal; 