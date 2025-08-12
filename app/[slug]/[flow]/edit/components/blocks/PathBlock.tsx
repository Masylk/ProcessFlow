import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
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
import { useModalStore } from '../../store/modalStore';
import { useStrokeLinesStore } from '../../store/strokeLinesStore';
import { useReactFlow } from '@xyflow/react';
import { CustomTooltip } from '@/app/components/CustomTooltip';

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
  const setShowConnectModal = useModalStore(
    (state) => state.setShowConnectModal
  );
  const showConnectModal = useModalStore((state) => state.showConnectModal);
  const connectData = useModalStore((state) => state.connectData);
  const setConnectData = useModalStore((state) => state.setConnectData);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const colors = useColors();
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  const { allStrokeLinesVisible } = useStrokeLinesStore();
  const { getEdges } = useReactFlow();

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

  // Add URL regex constant
  const URL_REGEX = /(https?:\/\/[^\s]+)/g;

  // Add parseTextWithLinks function
  const parseTextWithLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = URL_REGEX.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add the link
      parts.push({
        type: 'link',
        content: match[0],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last link
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnectMode && !isEditMode && !showModal) {
      setShowModal(true);
    }
  };

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
      setShowDropdown(false);
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

  // --- Stroke lines toggle logic ---
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
        className={`transition-opacity duration-300 ${
          isConnectMode &&
          id !== connectData?.sourceNode?.id &&
          id !== connectData?.targetNode?.id
            ? 'opacity-40'
            : isEditMode
              ? 'opacity-40'
              : ''
        }`}
        onClick={handleBlockClick}
      >
        <div
          className="transition-all duration-300 relative rounded-lg bg-white shadow-sm overflow-hidden min-w-[481px] max-w-[481px]"
          style={{
            backgroundColor: colors['bg-primary'],
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: showModal
              ? colors['border-brand_alt']
              : colors['border-secondary'],
          }}
        >
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

          {/* Header - Condition styling */}
          <div
            className="p-[17px] flex items-center justify-between"
            style={{
              borderBottom: data.block.description
                ? `1px solid ${colors['border-secondary']}`
                : 'none',
            }}
          >
            {/* Icon section */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: colors['bg-primary'],
                  border: `1px solid ${colors['border-secondary']}`,
                }}
              >
                {data.block.signedIconUrl ? (
                  <img
                    src={data.block.signedIconUrl}
                    alt="Block Icon"
                    className="w-6 h-6"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : data.block.icon && data.block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                    <img
                      src={data.block.icon}
                      alt="Block Icon"
                      className="w-6 h-6"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
                    alt="Default Icon"
                    className="w-6 h-6"
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <div
                  className="text-xs font-medium"
                  style={{ color: colors['fg-tertiary'] }}
                >
                  Condition
                </div>
                <div
                  className="text-sm font-semibold break-words line-clamp-1"
                  style={{ color: colors['fg-primary'], width: '333px' }}
                >
                  {data.block.title || 'Untitled Condition'}
                </div>
              </div>
            </div>
            {/* Dropdown toggle button with hover effect */}
            <button
              className="p-1 rounded-md transition-colors hover:bg-opacity-80"
              style={{
                color: colors['fg-tertiary'],
                backgroundColor: 'transparent',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-secondary'];
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={handleDropdownToggle}
              type="button"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
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
                  backgroundColor: colors['bg-secondary'],
                  border: `1px solid ${colors['border-primary']}`,
                  left: dropdownPosition.x,
                  top: dropdownPosition.y,
                  zIndex: 99999999,
                }}
                className="fixed shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 flex flex-col overflow-hidden cursor-pointer rounded-lg"
              >
                {/* Connect block - now first */}
                <div
                  onClick={handleConnectClick}
                  className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`}
                          alt="Connect"
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        Connect block
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit */}
                <div
                  onClick={handleEdit}
                  className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                      <div className="w-4 h-4 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                          alt="Edit"
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        Edit
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="self-stretch h-px border-b my-1"
                />

                {/* Delete */}
                <div
                  onClick={handleDelete}
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
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                          alt="Delete"
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        Delete
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Content section - only render if there's content */}
          {data.block.description && (
            <div className="p-[17px] flex flex-col gap-[13.7px]">
              <p
                className="text-xs mt-1 line-clamp-2 break-words whitespace-pre-line"
                style={{ color: colors['fg-tertiary'] }}
              >
                {parseTextWithLinks(data.block.description).map(
                  (
                    segment: { type: string; content: string },
                    index: number
                  ) =>
                    segment.type === 'link' ? (
                      <a
                        key={index}
                        href={segment.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          window.open(
                            segment.content,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }}
                      >
                        {segment.content}
                      </a>
                    ) : (
                      <span key={index}>{segment.content}</span>
                    )
                )}
              </p>
            </div>
          )}
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
