import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import { Path } from '../types';

interface CreateParallelPathModalProps {
  onClose: () => void;
  onConfirm: (data: {
    paths_to_create: string[];
    path_to_move: number;
  }) => void;
  path: Path;
  position: number;
  existingPaths?: string[];
}

const CreateParallelPathModal: React.FC<CreateParallelPathModalProps> = ({
  onClose,
  onConfirm,
  path,
  position,
  existingPaths = [],
}) => {
  const [pathNames, setPathNames] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<number>(0);

  // Initialize pathNames with existing paths when the modal opens
  useEffect(() => {
    if (existingPaths.length > 0) {
      setPathNames(existingPaths);
    } else {
      setPathNames(['Path n°1', 'Path n°2']);
    }
  }, [existingPaths]);

  // Check if there are blocks after the specified position
  const hasBlocksAfterPosition = (position: number) => {
    return path.blocks.some((block) => block.position > position);
  };

  // Check if any path name is empty
  const hasEmptyPath = pathNames.some((name) => name.trim() === '');

  return (
    <Modal
      title="Add Conditions"
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
            onClick={() =>
              onConfirm({
                paths_to_create: pathNames,
                path_to_move: selectedPath,
              })
            }
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
                  Path n°{index + 1}
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
                  placeholder={`This is your path n°${index + 1}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setPathNames([...pathNames, `Path n°${pathNames.length + 1}`])
            }
            className="w-full py-2 text-sm text-blue-500 hover:bg-blue-100 border border-blue-500 rounded transition-colors duration-200"
          >
            Add new path
          </button>
        </div>

        {hasBlocksAfterPosition(position) && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Move blocks to</label>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
            >
              {pathNames.map((name, index) => (
                <option key={index} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateParallelPathModal;
