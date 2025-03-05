import React, { useCallback } from 'react';
import { createParallelPaths } from '../utils/createParallelPaths';
import { DropdownDatas, Path } from '../types';
import { BlockEndType } from '@/types/block';

interface AddBlockDropdownMenuProps {
  dropdownDatas: DropdownDatas;
  onSelect: (blockType: 'STEP' | 'PATH' | 'DELAY') => void;
  onClose: () => void;
  workspaceId: string;
  workflowId: string;
  onPathsUpdate: (paths: Path[]) => void;
}

const AddBlockDropdownMenu: React.FC<AddBlockDropdownMenuProps> = ({
  dropdownDatas,
  onSelect,
  onClose,
  workspaceId,
  workflowId,
  onPathsUpdate,
}) => {
  const menuItems = [
    {
      type: 'STEP' as const,
      label: 'Step Block',
      icon: '/step-icons/default-icons/container.svg',
    },
    {
      type: 'PATH' as const,
      label: 'Path Block',
      icon: '/step-icons/default-icons/path.svg',
    },
    {
      type: 'DELAY' as const,
      label: 'Delay Block',
      icon: '/step-icons/default-icons/delay.svg',
    },
  ];

  const handleSelect = useCallback(
    async (type: string) => {
      if (type === 'PATH') {
        console.log(
          'creating parallel paths: ',
          dropdownDatas.path,
          dropdownDatas.position
        );
        try {
          await createParallelPaths(dropdownDatas.path, dropdownDatas.position);
          console.log('parallel paths created');

          // Fetch updated paths data
          const pathsResponse = await fetch(
            `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
          );
          if (pathsResponse.ok) {
            const pathsData = await pathsResponse.json();
            onPathsUpdate(pathsData.paths);
          }

          onClose();
        } catch (error) {
          console.error('Error creating parallel paths:', error);
        }
      } else {
        console.log('creating block');
        onSelect(type as 'STEP' | 'PATH' | 'DELAY');
      }
    },
    [dropdownDatas, onClose, onSelect, workspaceId, workflowId, onPathsUpdate]
  );

  const block = dropdownDatas.path.blocks.find(
    (b) => b.position === dropdownDatas.position
  );
  const isLastBlock = block?.type === BlockEndType.LAST;

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50"
        style={{
          top: dropdownDatas.y,
          left: dropdownDatas.x,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.type}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
            onClick={() => handleSelect(item.type)}
          >
            <img src={item.icon} alt={item.label} className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}

        {isLastBlock && (
          <button
            onClick={async () => {
              try {
                await fetch(`/api/blocks/${block.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: BlockEndType.END,
                  }),
                });

                // Fetch updated paths data
                const pathsResponse = await fetch(
                  `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
                );
                if (pathsResponse.ok) {
                  const pathsData = await pathsResponse.json();
                  onPathsUpdate(pathsData.paths);
                }

                onClose();
              } catch (error) {
                console.error('Error converting block to END:', error);
              }
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Convert to End Block
          </button>
        )}
      </div>
    </>
  );
};

export default AddBlockDropdownMenu;
