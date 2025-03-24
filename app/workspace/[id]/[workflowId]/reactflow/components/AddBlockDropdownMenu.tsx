import React, { useCallback, useState } from 'react';
import { createParallelPaths } from '../utils/createParallelPaths';
import { DropdownDatas, Path } from '../../types';
import { BlockEndType } from '@/types/block';
import { useClipboardStore } from '../store/clipboardStore';
import { useModalStore } from '../store/modalStore';

interface AddBlockDropdownMenuProps {
  dropdownDatas: DropdownDatas;
  onSelect: (blockType: 'STEP' | 'PATH' | 'DELAY') => void;
  onClose: () => void;
  workspaceId: string;
  workflowId: string;
  onPathsUpdate: (paths: Path[] | ((currentPaths: Path[]) => Path[])) => void;
}

const AddBlockDropdownMenu: React.FC<AddBlockDropdownMenuProps> = ({
  dropdownDatas,
  onSelect,
  onClose,
  workspaceId,
  workflowId,
  onPathsUpdate,
}) => {
  const copiedBlock = useClipboardStore((state) => state.copiedBlock);
  const { setShowModal, setModalData } = useModalStore();

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
        setModalData({
          path: dropdownDatas.path,
          position: dropdownDatas.position,
          existingPaths: [],
        });
        setShowModal(true);
        onClose();
      } else {
        onSelect(type as 'STEP' | 'PATH' | 'DELAY');
        onClose();
      }
    },
    [onSelect, onClose, setShowModal, setModalData, dropdownDatas]
  );

  const handlePasteBlock = async () => {
    if (!copiedBlock) return;

    try {
      const response = await fetch(`/api/blocks/${copiedBlock.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: dropdownDatas.position,
          path_id: dropdownDatas.path.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to paste block');

      const result = await response.json();
      onPathsUpdate(result.paths);
      onClose();
    } catch (error) {
      console.error('Error pasting block:', error);
    }
  };

  const block = dropdownDatas.path.blocks.find(
    (b) => b.position === dropdownDatas.position
  );
  const isLastBlock = block?.type === BlockEndType.LAST;

  // Get existing child paths for the current block
  const existingPaths = block?.child_paths.map((cp) => cp.path.name) || [];

  // Check if the source block is a LastNode
  const isLastNode =
    dropdownDatas.path.blocks.find(
      (block) => block.position === dropdownDatas.position
    )?.type === 'LAST';

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

                // Update the block type in paths store
                onPathsUpdate((currentPaths) =>
                  currentPaths.map((path) => {
                    if (path.id === dropdownDatas.path.id) {
                      return {
                        ...path,
                        blocks: path.blocks.map((b) =>
                          b.id === block.id
                            ? { ...b, type: BlockEndType.END }
                            : b
                        ),
                      };
                    }
                    return path;
                  })
                );

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

        {copiedBlock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePasteBlock();
            }}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
          >
            <img
              src="/step-icons/default-icons/paste.svg"
              alt="Paste"
              className="w-5 h-5"
            />
            <span>Paste Block</span>
          </button>
        )}
      </div>
    </>
  );
};

export default AddBlockDropdownMenu;
