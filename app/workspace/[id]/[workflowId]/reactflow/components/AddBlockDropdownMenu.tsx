import React, { useCallback, useState } from 'react';
import { createParallelPaths } from '../utils/createParallelPaths';
import { DropdownDatas, Path, DelayType } from '../../types';
import { BlockEndType } from '@/types/block';
import { useClipboardStore } from '../store/clipboardStore';
import { useModalStore } from '../store/modalStore';
import { useColors } from '@/app/theme/hooks';
import DelayTypeModal from './modals/DelayTypeModal';

interface AddBlockDropdownMenuProps {
  dropdownDatas: DropdownDatas;
  onSelect: (
    blockType: 'STEP' | 'PATH' | 'DELAY',
    dropdownDatas: DropdownDatas,
    delayOptions?: {
      delayType?: DelayType;
      eventName?: string;
      seconds?: number;
    }
  ) => void;
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
  const colors = useColors();
  const copiedBlock = useClipboardStore((state) => state.copiedBlock);
  const { setShowModal, setModalData } = useModalStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showDelayTypeModal, setShowDelayTypeModal] = useState(false);

  const menuItems = [
    {
      type: 'STEP' as const,
      label: 'Step',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-commit.svg`,
    },
    {
      type: 'PATH' as const,
      label: 'Condition',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-04.svg`,
    },
    {
      type: 'DELAY' as const,
      label: 'Delay',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`,
    },
  ];

  const handleSelect = useCallback(
    async (type: string) => {
      if (type === 'PATH') {
        console.log('dropdownDatas', dropdownDatas);
        setModalData({
          path: dropdownDatas.path,
          position: dropdownDatas.position,
          existingPaths: [],
        });
        setShowModal(true);
        onClose();
      } else if (type === 'DELAY') {
        setShowDelayTypeModal(true);
      } else {
        onSelect(type as 'STEP' | 'PATH' | 'DELAY', dropdownDatas);
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

  // Get existing child paths for the current path
  const existingPaths = block?.child_paths.map((cp) => cp.path.name) || [];

  // Check if the source path is a LastNode
  const isLastNode =
    dropdownDatas.path.blocks.find(
      (block) => block.position === dropdownDatas.position
    )?.type === 'LAST';

  const handleDelayTypeSelect = (
    delayType: DelayType,
    data: { seconds?: number; eventName?: string }
  ) => {
    // Send the delay data to the parent component
    onSelect('DELAY', dropdownDatas, {
      delayType,
      seconds: data.seconds,
      eventName: data.eventName,
    });
    onClose();
  };

  const handleDelayTypeClose = () => {
    setShowDelayTypeModal(false);
    onClose();
  };

  return (
    <>
      {/* Always render the DelayTypeModal but control visibility with isVisible prop */}
      <DelayTypeModal
        onClose={handleDelayTypeClose}
        onSelect={handleDelayTypeSelect}
        isVisible={showDelayTypeModal}
      />

      {/* Render dropdown menu only if delay type modal is not shown */}
      {!showDelayTypeModal && (
        <>
          <div className="fixed inset-0" onClick={onClose} />
          <div
            className="absolute shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] rounded-lg border z-50 py-1 flex flex-col overflow-hidden cursor-pointer"
            style={{
              top: dropdownDatas.y,
              left: dropdownDatas.x,
              transform: 'translate(-50%, -100%)',
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-primary'],
              zIndex: 99999999,
            }}
          >
            <div className="py-1">
              <div
                className="w-[240px] px-2.5 py-[9px] text-sm font-normal"
                style={{ color: colors['text-secondary'] }}
              >
                Add under this a:
              </div>

              <div
                className="h-px my-1"
                style={{ backgroundColor: colors['border-secondary'] }}
              />

              {menuItems.map((item) => (
                <div
                  key={item.type}
                  className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                  onClick={() => handleSelect(item.type)}
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <img
                          src={item.icon}
                          alt={item.label}
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLastBlock && (
                <div
                  className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
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
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stop-circle.svg`}
                          alt="End Block"
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        End Block
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {copiedBlock && (
                <div
                  className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                  onClick={handlePasteBlock}
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clipboard-paste.svg`}
                          alt="Paste"
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        Paste Block
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddBlockDropdownMenu;
