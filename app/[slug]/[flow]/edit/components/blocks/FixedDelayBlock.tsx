import React, { useState, useEffect } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { DelayType, NodeData } from '../../../types';
import { useColors } from '@/app/theme/hooks';
import { createPortal } from 'react-dom';
import DelayTypeModal from '../modals/DelayTypeModal';
import FixedDelayModal from '../modals/FixedDelayModal';
import EventDelayModal from '../modals/EventDelayModal';
import { usePathsStore } from '../../store/pathsStore';
import { usePathSelectionStore } from '../../store/pathSelectionStore';
import { useUpdateModeStore } from '../../store/updateModeStore';

const FixedDelayBlock = ({
  id,
  data,
  selected,
}: NodeProps & { data: NodeData }) => {
  const colors = useColors();
  const { block } = data;
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showFixedDelayModal, setShowFixedDelayModal] = useState(false);
  const [showEventDelayModal, setShowEventDelayModal] = useState(false);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);

  // --- Checkbox and update checkbox logic ---
  const {
    selectedPaths,
    parentBlockId,
    togglePathSelection,
    mergeMode,
    setMergeMode,
  } = usePathSelectionStore();
  const {
    isUpdateMode,
    setUpdateMode,
    mergePathId,
    setMergePathId,
    setSelectedEndBlocks,
    setOriginalEndBlocks,
    selectedEndBlocks,
    toggleEndBlockSelection,
    originalEndBlocks,
    triggerPathId,
    setTriggerPathId,
  } = useUpdateModeStore();

  // Find the merge block in the current path
  const mergeBlock = React.useMemo(
    () => data.path?.blocks.find((block) => block.type === 'MERGE'),
    [data.path?.blocks]
  );

  // Determine if merging to the same child
  const isMergingToSameChild = React.useMemo(() => {
    const childPaths = mergeBlock?.child_paths;
    if (childPaths && childPaths.length > 0 && mergePathId) {
      return childPaths[0].path_id === mergePathId;
    }
    return true;
  }, [mergeBlock, mergePathId]);

  // Is this the last STEP node in a path?
  const isLastStepInPath =
    data.type === 'STEP' &&
    data.position === (data.path?.blocks.length ?? 0) - 2;

  // Get parent block ID for this path
  const pathParentBlockId = data.path?.parent_blocks?.[0]?.block_id;

  // Check if parent block has more than one child path
  const parentHasMultipleChildPaths = data.hasSiblings;

  // Get the end block and check if it has child paths
  const endBlock = data.path?.blocks.find(
    (block) => block.type === 'END' || block.type === 'LAST'
  );

  // Condition for showing merge-related UI
  const canShowMergeUI =
    parentHasMultipleChildPaths &&
    !data.pathHasChildren &&
    (parentBlockId === null || pathParentBlockId === parentBlockId);

  // Use this condition for both checkbox and dropdown option
  const showCheckbox = mergeMode && canShowMergeUI;

  // --- Update checkbox logic ---
  const showUpdateCheckbox = React.useMemo(() => {
    return (
      isUpdateMode &&
      data.path?.parent_blocks?.[0]?.block_id === triggerPathId &&
      isMergingToSameChild
    );
  }, [
    isUpdateMode,
    data.path?.parent_blocks,
    triggerPathId,
    isMergingToSameChild,
  ]);

  // Get the end block ID for this path
  const endBlockId = data.path?.blocks.find(
    (block) =>
      block.type === 'END' || block.type === 'LAST' || block.type === 'MERGE'
  )?.id;

  // Add useEffect for handling clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right - 170,
        y: rect.bottom + 4,
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handleModifyDelay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDelayModal(true);
    setShowDropdown(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(id);
    setShowDropdown(false);
  };

  // Add this handler for activating update mode (edit merge)
  const handleUpdateModeActivation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);

    // Get the parent block ID of the current node
    const parentBlockId = data.path?.parent_blocks?.[0]?.block_id;

    if (!parentBlockId) {
      console.error('No parent block found');
      return;
    }

    // Find the merge block in the current path
    const mergeBlock = data.path?.blocks.find(
      (block) => block.type === 'MERGE'
    );

    if (!mergeBlock || !mergeBlock.child_paths[0]) {
      console.error('No merge block or child path found');
      return;
    }

    const mergePathId = mergeBlock.child_paths[0].path_id;
    const mergePath = allPaths.find((path) => path.id === mergePathId);

    if (!mergePath) {
      console.error('Merge path not found');
      return;
    }

    const parentBlocks = mergePath.parent_blocks.map((pb) => pb.block_id);

    setUpdateMode(true);
    setMergePathId(mergePathId);
    setSelectedEndBlocks(parentBlocks);
    setOriginalEndBlocks(parentBlocks);
    setTriggerPathId(parentBlockId); // Set the triggering node's parent block ID
  };

  const renderDropdown = () => {
    if (!showDropdown) return null;
    return createPortal(
      <div
        style={{
          backgroundColor: colors['bg-secondary'],
          border: `1px solid ${colors['border-primary']}`,
          left: dropdownPosition.x,
          top: dropdownPosition.y,
          zIndex: 99999999,
        }}
        className="fixed shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 flex flex-col overflow-hidden cursor-pointer rounded-lg"
      >
        {/* Merge paths option */}
        {canShowMergeUI && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setMergeMode(true);
              togglePathSelection(
                data.path?.id ?? -1,
                endBlock?.id ?? -1,
                pathParentBlockId ?? -1
              );
              setShowDropdown(false);
            }}
            className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
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
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-merge.svg`}
                    alt="Merge Paths"
                    className="w-4 h-4"
                  />
                </div>
                <div
                  style={{ color: colors['text-primary'] }}
                  className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                >
                  Merge paths
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit merge option */}
        {data.pathIsMerged && (
          <div
            onClick={handleUpdateModeActivation}
            className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
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
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                    alt="Edit Merge"
                    className="w-4 h-4"
                  />
                </div>
                <div
                  style={{ color: colors['text-primary'] }}
                  className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                >
                  Edit merge
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          onClick={handleModifyDelay}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div
            style={
              { '--hover-bg': colors['bg-quaternary'] } as React.CSSProperties
            }
            className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                  alt="Modify"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Modify delay
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={handleDelete}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div
            style={
              { '--hover-bg': colors['bg-quaternary'] } as React.CSSProperties
            }
            className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                  alt="Delete"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Delete delay
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const delayText = () => {
    if (!block.delay_seconds) return '';
    const days = Math.floor(block.delay_seconds / 86400);
    const hours = Math.floor((block.delay_seconds % 86400) / 3600);
    const minutes = Math.floor((block.delay_seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

    return parts.join(' and ');
  };

  return (
    <div className="w-[382px] relative">
      {/* --- Checkbox UI --- */}
      {showCheckbox && (
        <div className="absolute -top-8 left-0 flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-200">
            <input
              type="checkbox"
              checked={selectedPaths.includes(data.path?.id ?? -1)}
              onChange={() =>
                togglePathSelection(
                  data.path?.id ?? -1,
                  endBlock?.id ?? -1,
                  pathParentBlockId ?? -1
                )
              }
              style={
                {
                  borderColor: colors['border-primary'],
                  '--bg-brand-primary': colors['bg-brand-solid'],
                  '--border-brand': colors['border-brand'],
                  '--bg-secondary': colors['bg-primary'],
                } as React.CSSProperties
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm text-gray-300 dark:text-gray-600">
              {selectedPaths.includes(data.path?.id ?? -1)
                ? 'Selected'
                : 'Not selected'}
            </span>
          </div>
        </div>
      )}

      {/* --- Update Checkbox UI --- */}
      {showUpdateCheckbox && endBlockId && (
        <div className="absolute -top-8 left-0 flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-200">
            <input
              type="checkbox"
              checked={selectedEndBlocks.includes(endBlockId)}
              onChange={() => toggleEndBlockSelection(endBlockId)}
              style={
                {
                  borderColor: colors['border-primary'],
                  '--bg-brand-primary': colors['bg-brand-solid'],
                  '--border-brand': colors['border-brand'],
                  '--bg-secondary': colors['bg-primary'],
                } as React.CSSProperties
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm text-gray-300 dark:text-gray-600">
              {selectedEndBlocks.includes(endBlockId)
                ? 'Selected'
                : 'Not selected'}
            </span>
          </div>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 8,
          height: 8,
          opacity: 0,
          background: colors['fg-brand-primary'],
          border: `2px solid ${colors['bg-primary']}`,
          pointerEvents: 'none',
        }}
      />
      <div
        className="p-4 rounded-xl border-2 flex flex-col gap-4"
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary'],
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                border: `1px solid ${colors['border-secondary']}`,
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`}
                alt="Fixed Delay"
                className="w-6 h-6"
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Fixed Duration
            </span>
          </div>
          <button
            className="p-1 rounded-md hover:bg-[var(--hover-bg)] transition-all duration-300"
            onClick={handleDropdownToggle}
            style={
              {
                '--hover-bg': colors['bg-quaternary'],
              } as React.CSSProperties
            }
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
              alt="Menu"
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* Tooltip */}
        <div
          className="flex items-center gap-2 p-3 mt-auto rounded-lg bg-opacity-5"
          style={{ backgroundColor: colors['bg-secondary'] }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
            alt="Info"
            className="w-5 h-5"
          />
          <span className="text-sm" style={{ color: colors['text-secondary'] }}>
            Flow paused for {delayText()}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 8,
          height: 8,
          opacity: 0,
          background: colors['fg-brand-primary'],
          border: `2px solid ${colors['bg-primary']}`,
          pointerEvents: 'none',
        }}
      />
      {renderDropdown()}
      {showDelayModal && (
        <DelayTypeModal
          onClose={() => setShowDelayModal(false)}
          onSelect={async (delayType, delayData) => {
            try {
              setShowDelayModal(false);
              const blockId = id.replace('block-', '');
              const response = await fetch(`/api/blocks/${blockId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'DELAY',
                  delay_type: delayType,
                  delay_seconds: delayData.seconds,
                  delay_event: delayData.eventName,
                }),
              });

              if (!response.ok) throw new Error('Failed to update delay');

              const updatedBlock = await response.json();
              const updatedPaths = allPaths.map((path) => ({
                ...path,
                blocks: path.blocks.map((block) =>
                  block.id === parseInt(blockId)
                    ? { ...block, ...updatedBlock }
                    : block
                ),
              }));

              setAllPaths(updatedPaths);
              data.onPathsUpdate?.(updatedPaths);
            } catch (error) {
              console.error('Error updating delay:', error);
            }
          }}
          initialData={{
            delayType: data.delayType || undefined,
            eventName: data.eventName || undefined,
            seconds: data.seconds || undefined,
          }}
        />
      )}
    </div>
  );
};

export default FixedDelayBlock;
