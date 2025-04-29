import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, Position, Handle, Node } from '@xyflow/react';
import { DelayType, NodeData } from '../../../types';
import { useColors } from '@/app/theme/hooks';
import { createPortal } from 'react-dom';
import DelayTypeModal from '../modals/DelayTypeModal';
import { usePathsStore } from '../../store/pathsStore';
import { usePathSelectionStore } from '../../store/pathSelectionStore';
import { useUpdateModeStore } from '../../store/updateModeStore';
import { useModalStore } from '../../store/modalStore';
import { BasicBlock } from './BasicBlock';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useStrokeLinesStore } from '../../store/strokeLinesStore';
import { useReactFlow } from '@xyflow/react';
import { CustomTooltip } from '@/app/components/CustomTooltip';

const EventDelayBlock = (props: NodeProps & { data: NodeData }) => {
  const { id, data } = props;
  const colors = useColors();
  const { block } = data;
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showDelayModal, setShowDelayModal] = useState(false);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  const setShowConnectModal = useModalStore(
    (state) => state.setShowConnectModal
  );
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const showConnectModal = useModalStore((state) => state.showConnectModal);
  const connectData = useModalStore((state) => state.connectData);
  const setConnectData = useModalStore((state) => state.setConnectData);
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

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectData({
      sourceNode: {
        id,
        data,
        position: { x: 0, y: 0 },
        type: 'custom',
        width: undefined,
        height: undefined,
      } as Node,
    });
    setShowConnectModal(true);
    setShowDropdown(false);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dropdownWidth = 170; // px
      const dropdownHeight = 280; // px, estimate for dropdown height
      const offset = 4; // px

      let x = rect.right - 30;
      // Default: show below
      let y = rect.bottom + offset;

      // Clamp to right edge
      if (x + dropdownWidth > window.innerWidth - 8) {
        x = window.innerWidth - dropdownWidth - 8;
      }
      // Clamp to left edge
      if (x < 8) {
        x = 8;
      }

      // If not enough space below, flip above
      if (y + dropdownHeight > window.innerHeight - 8) {
        // Try to show above the trigger
        y = rect.top - dropdownHeight / 1.5 - offset;
        // If still offscreen, clamp to top
        if (y < 8) y = window.innerHeight - dropdownHeight - 8;
        // If dropdown is taller than viewport, stick to top
        if (y < 8) y = 8;
      }

      setDropdownPosition({ x, y });
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
          onClick={handleConnectClick}
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
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`}
                  alt="Modify"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Connect block
              </div>
            </div>
          </div>
        </div>

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

        {/* Separator */}
        <div
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1"
        />

        <div
          onClick={handleDelete}
          className="self-stretch px-1.5 py-px flex items-center gap-3"
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
                Delete
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const expirationText = () => {
    if (!block.delay_seconds) return '';
    const days = Math.floor(block.delay_seconds / 86400);
    const hours = Math.floor((block.delay_seconds % 86400) / 3600);
    const minutes = Math.floor((block.delay_seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

    return parts.length > 0 ? `${parts.join(' and ')}` : '';
  };

  // --- Stroke lines toggle logic ---
  const { allStrokeLinesVisible } = useStrokeLinesStore();
  const { getEdges } = useReactFlow();

  // Tooltip hook (copied from CustomBlock)
  const useTooltip = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<number | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
      setShowTooltip(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false);
      setTooltipPosition(null);
    }, []);

    useEffect(() => {
      if (showTooltip && tooltipRef.current && elementRef.current) {
        const toggleRect = elementRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const gap = 12; // gap between toggle and tooltip
        setTooltipPosition(-(tooltipRect.width + gap));
      }
    }, [showTooltip]);

    return {
      elementRef,
      tooltipRef,
      showTooltip,
      tooltipPosition,
      handleMouseEnter,
      handleMouseLeave,
    };
  };

  const {
    elementRef,
    tooltipRef,
    showTooltip,
    tooltipPosition,
    handleMouseEnter,
    handleMouseLeave,
  } = useTooltip();

  // Toggle handler (copied from CustomBlock)
  const toggleStrokeLines = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!allStrokeLinesVisible) return;
    const blockId = parseInt(id.replace('block-', ''));
    const newVisibility = !data.strokeLinesVisible;
    data.updateStrokeLineVisibility?.(blockId, newVisibility);
  };

  return (
    <BasicBlock {...props}>
      {/* --- Vertical Toggle Switch Container (copied from CustomBlock) --- */}
      {getEdges().some(
        (edge) => edge.source === id && edge.type === 'strokeEdge'
      ) &&
        !showConnectModal && (
          <div
            className="absolute top-[50%] -translate-y-1/2 transition-opacity duration-300"
            style={{
              left: '-20px',
              backgroundColor: colors['bg-primary'],
              padding: '4px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors['border-secondary']}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '6px',
            }}
          >
            <div
              ref={elementRef}
              onClick={toggleStrokeLines}
              className={`${allStrokeLinesVisible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                width: '12px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor:
                  allStrokeLinesVisible && data.strokeLinesVisible
                    ? '#FF69A3'
                    : colors['bg-quaternary'],
                transition: 'background-color 0.2s',
                position: 'relative',
                opacity: allStrokeLinesVisible ? 1 : 0.5,
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: colors['bg-primary'],
                  position: 'absolute',
                  left: '1px',
                  top:
                    allStrokeLinesVisible && data.strokeLinesVisible
                      ? '1px'
                      : '9px',
                  transition: 'top 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          </div>
        )}

      {/* Tooltip for the toggle */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: '-210px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <CustomTooltip
            text={
              allStrokeLinesVisible
                ? data.strokeLinesVisible
                  ? 'Hide connecting lines'
                  : 'Show connecting lines'
                : 'Global connecting lines are disabled in Settings'
            }
            show={true}
            direction="left"
          />
        </div>
      )}
      <div
        className={`w-[481px] relative ${
          isConnectMode &&
          id !== connectData?.sourceNode?.id &&
          id !== connectData?.targetNode?.id
            ? 'opacity-40'
            : ''
        }`}
      >
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
            cursor: 'default',
          }}
        />
        <div
          className="rounded-lg border-2 flex flex-col"
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary'],
          }}
        >
          {/* Header with separator */}
          <div 
            className="p-[17px] flex items-center justify-between"
            style={{
              borderBottom: `1px solid ${colors['border-secondary']}`
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  border: `1px solid ${colors['border-secondary']}`,
                }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`}
                  alt="Event Delay"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-xs font-medium" style={{ color: colors['fg-tertiary'] }}>
                  Delay
                </div>
                <div className="text-sm font-semibold" style={{ color: colors['fg-primary'] }}>
                  Event-Based Delay
                </div>
              </div>
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
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Content section */}
          <div className="p-[17px] flex flex-col gap-[13.7px]">
            {block.delay_event && (
              <div className="flex items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: colors['text-secondary'] }}
                >
                  Waiting for:
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: colors['text-primary'] }}
                >
                  {block.delay_event}
                </span>
              </div>
            )}

            {(block.delay_seconds ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/hourglass-01.svg`}
                  alt="Clock"
                  className="w-4 h-4"
                />
                <span
                  className="text-sm"
                  style={{ color: colors['text-secondary'] }}
                >
                  Expires after {expirationText()}
                </span>
              </div>
            )}

            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-opacity-5"
              style={{ backgroundColor: colors['bg-secondary'] }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
                alt="Info"
                className="w-5 h-5"
              />
              <span
                className="text-sm whitespace-nowrap"
                style={{ color: colors['text-secondary'] }}
              >
                {(block.delay_seconds ?? 0) > 0
                  ? 'Flow paused until event occurs or time expires'
                  : 'Flow paused until event occurs'}
              </span>
            </div>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Left}
          id="stroke_source"
          style={{
            width: 8,
            height: 8,
            background: colors['fg-tertiary'],
            border: `2px solid ${colors['bg-primary']}`,
            top: '35%',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="stroke_target"
          style={{
            width: 8,
            height: 8,
            background: colors['fg-tertiary'],
            border: `2px solid ${colors['bg-primary']}`,
            top: '35%',
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="stroke_self_target"
          style={{
            width: 8,
            height: 8,
            background: colors['fg-tertiary'],
            border: `2px solid ${colors['bg-primary']}`,
            top: '65%',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
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
    </BasicBlock>
  );
};

export default EventDelayBlock;
