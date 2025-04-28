import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import UpdatePathModal from '../modals/UpdatePathModal';
import { createChildPaths } from '../../utils/createChildPaths';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { useColors } from '@/app/theme/hooks';
import { BasicBlock } from './BasicBlock';
import { createPortal } from 'react-dom';
import collectAllPathIds from '../../utils/collectAllPathIds';
import { usePathsStore } from '../../store/pathsStore';
import { BlockEndType } from '@/types/block';

function PathBlock(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const colors = useColors();
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  // Find the path block to get the count of existing child paths
  const pathBlock = data.path?.blocks.find(
    (block: { id: number }) => block.id === parseInt(id.replace('block-', ''))
  );

  const existingPathsCount = pathBlock?.child_paths?.length || 0;
  // Get the names and IDs of existing child paths
  const existingPaths: { id: number; name: string }[] =
    pathBlock?.child_paths?.map((cp) => ({
      id: cp.path.id,
      name: cp.path.name,
    })) || [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  /**
   * Handles updating, adding, and removing child paths.
   * @param modalData Object containing condition name, description, icon, and path updates
   */
  const handleCreateChildPaths = async (modalData: {
    conditionName: string;
    conditionDescription: string;
    icon?: string;
    pathsToUpdate: { index: number; name: string }[];
    pathsToAdd: string[];
    pathsToRemove: { index: number; name: string }[];
  }) => {
    try {
      setShowModal(false);

      if (!data.path?.workflow_id || !data.path) {
        throw new Error('Path data is missing');
      }

      // Add new paths
      if (modalData.pathsToAdd.length > 0) {
        await createChildPaths(
          modalData.pathsToAdd,
          data.path.workflow_id,
          data.path
        );
      }

      // Delete removed paths
      if (modalData.pathsToRemove.length > 0) {
        const pathsToRemoveIds = modalData.pathsToRemove.map(
          (path) => existingPaths[path.index].id
        );
        await Promise.all(
          pathsToRemoveIds.map(async (id) => {
            await fetch(`/api/paths/${id}`, {
              method: 'DELETE',
            });
          })
        );
      }

      // Update existing paths
      if (modalData.pathsToUpdate.length > 0) {
        const pathsToUpdateIdsandname = modalData.pathsToUpdate.map((path) => ({
          id: existingPaths[path.index].id,
          name: path.name,
        }));
        await Promise.all(
          pathsToUpdateIdsandname.map(async (path) => {
            await fetch(`/api/paths/${path.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: path.name }),
            });
          })
        );
      }

      // Update the block with condition data
      await fetch(`/api/blocks/${pathBlock?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modalData.conditionName,
          title: modalData.conditionName,
          description: modalData.conditionDescription,
          icon: modalData.icon,
        }),
      });

      // Just fetch the updated paths to refresh the UI
      const pathsResponse = await fetch(
        `/api/workspace/${data.path.workflow_id}/paths?workflow_id=${data.path.workflow_id}`
      );
      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        data.onPathsUpdate?.(pathsData.paths);
      }
    } catch (error) {
      console.error('Error managing child paths:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dropdownWidth = 180; // px, matches minWidth below
      const dropdownHeight = 120; // px, estimate for 2 options
      const offset = 6; // px, gap below the button

      let x = rect.right - 30;
      let y = rect.bottom + offset;

      // // Clamp to right edge
      // if (x + dropdownWidth > window.innerWidth - 8) {
      //   x = window.innerWidth - dropdownWidth - 8;
      // }
      // // Clamp to left edge
      // if (x < 8) {
      //   x = 8;
      // }

      // // If not enough space below, flip above
      // if (y + dropdownHeight > window.innerHeight - 8) {
      //   y = rect.top - dropdownHeight - offset;
      //   if (y < 8) y = 8;
      // }

      setDropdownPosition({ x, y });
    }
    setShowDropdown((prev) => !prev);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    setShowModal(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);

    if (!data.path) {
      console.error('Path data is missing');
      return;
    }
    const path = allPaths.find((p) => p.id === data.path?.id);
    if (!path) {
      console.error('Path not found');
      return;
    }

    // 1. Prepare blocksToDelete and previousPaths
    const blocksToDelete = [data.block.id];
    const previousPaths = allPaths;

    // 2. Find the last block to delete by position
    const blocksToDeleteSet = new Set(blocksToDelete);
    const blocksToDeleteInPath = data.path.blocks.filter((b) =>
      blocksToDeleteSet.has(b.id)
    );
    const lastBlockToDelete = blocksToDeleteInPath.length
      ? blocksToDeleteInPath.reduce((prev, curr) =>
          curr.position > prev.position ? curr : prev
        )
      : null;

    // 3. Check the last block to delete for special child path logic
    let pathIdsToActuallyDelete = collectAllPathIds(data.path, allPaths);
    if (
      lastBlockToDelete &&
      Array.isArray(lastBlockToDelete.child_paths) &&
      lastBlockToDelete.child_paths.length === 1
    ) {
      const childPathId = lastBlockToDelete.child_paths[0].path_id;
      const childPath = allPaths.find((p) => p.id === childPathId);
      if (
        childPath &&
        Array.isArray(childPath.parent_blocks) &&
        childPath.parent_blocks.length > 1
      ) {
        // Don't delete this path
        pathIdsToActuallyDelete = new Set();
      }
    }

    // 4. Optimistically update the store
    const updatedPaths = allPaths
      .filter((p) => !pathIdsToActuallyDelete.has(p.id)) // Remove descendant paths
      .map((p) => {
        if (p.id === path.id) {
          // Remove blocks to delete and reindex positions
          let remainingBlocks = p.blocks
            .filter(
              (b) =>
                !(
                  blocksToDelete.includes(b.id) &&
                  (b.type === 'STEP' || b.type === 'DELAY')
                )
            )
            .map((b, idx) => ({ ...b, position: idx }));
          // Set the last block to type LAST if it exists in remainingBlocks and is not MERGE
          if (lastBlockToDelete && lastBlockToDelete.type !== 'MERGE') {
            const idx = remainingBlocks.findIndex(
              (b) => b.id === lastBlockToDelete.id
            );
            if (idx !== -1) {
              remainingBlocks[idx] = {
                ...remainingBlocks[idx],
                type: BlockEndType.LAST,
                child_paths: [],
              };
            }
          }
          return { ...p, blocks: remainingBlocks };
        }
        return p;
      });
    setAllPaths(updatedPaths);
    data.onPathsUpdate?.(updatedPaths);

    // 5. API call and rollback on error
    try {
      const response = await fetch('/api/blocks/delete-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockIds: blocksToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete blocks');
      }
      // Success: do nothing, optimistic update already applied
    } catch (error) {
      // Rollback to previous state
      setAllPaths(previousPaths);
      data.onPathsUpdate?.(previousPaths);
      console.error('Error deleting blocks:', error);
    }
  };

  return (
    <BasicBlock {...props}>
      <div
        className={`transition-opacity duration-300 ${
          isConnectMode || isEditMode ? 'opacity-40' : ''
        }`}
      >
        <div
          className="transition-all duration-300 relative rounded-[8px] bg-white shadow-sm overflow-hidden"
          style={{
            width: '481px',
            height: '200px',
          }}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />

          {/* Header - Blue background */}
          <div className="bg-[#4761C4] p-[17px] flex items-center justify-between">
            {/* Icon section */}
            <div className="flex items-center gap-[13.7px]">
              <div className="flex items-center">
                <div className="w-[46px] h-[46px] rounded-[11.6px] flex items-center justify-center bg-[#4761C4]">
                  {data.block.icon ? (
                    data.block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                      <img
                        src={data.block.icon}
                        alt="Block Icon"
                        className="w-[27px] h-[27px]"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${data.block.icon}`}
                        alt="Block Icon"
                        className="w-[27px] h-[27px]"
                      />
                    )
                  ) : (
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/default-icons/container.svg`}
                      alt="Default Icon"
                      className="w-[27px] h-[27px]"
                    />
                  )}
                </div>
              </div>
              <div className="text-[13.7px] font-semibold text-white leading-[1.5]">
                {data.block.title || 'Ticket Triage'}
              </div>
            </div>
            {/* Dropdown toggle button with hover effect */}
            <button
              className="w-[34px] h-[34px] rounded-[3.4px] flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]"
              onClick={handleDropdownToggle}
              type="button"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-white.svg`}
                alt="Menu"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Dropdown menu */}
          {showDropdown &&
            createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  left: dropdownPosition.x,
                  top: dropdownPosition.y,
                  zIndex: 1000,
                  minWidth: 180,
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(16,24,40,0.18)',
                  border: '1px solid #E5E7EB',
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                className="dropdown-menu"
              >
                <button
                  className="w-full text-left px-5 py-2 text-sm hover:bg-gray-100 transition"
                  onClick={handleEdit}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-5 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                  onClick={handleDelete}
                  type="button"
                >
                  Delete
                </button>
              </div>,
              document.body
            )}

          {/* Content - White background */}
          <div className="bg-white p-[17px] flex flex-col gap-[13.7px]">
            <div className="inline-flex items-center gap-1 px-2 py-[2px] bg-[#EDF0FB] border border-[#AEBBED] rounded-[8543px] w-fit">
              <span className="text-xs font-medium text-[#374C99]">
                Conditional
              </span>
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle-blue.svg`}
                alt="Help"
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col gap-[6.9px]">
              <div className="text-[12px] text-[#667085] leading-[1.43] whitespace-pre-line">
                {data.block.description || ''}
              </div>
            </div>
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        </div>

        {showModal && data.block && (
          <UpdatePathModal
            onClose={() => setShowModal(false)}
            onConfirm={handleCreateChildPaths}
            existingPathsCount={existingPathsCount}
            existingPaths={existingPaths.map((p) => p.name)}
            block={data.block}
          />
        )}
      </div>
    </BasicBlock>
  );
}

export default PathBlock;
