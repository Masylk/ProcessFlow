import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Handle,
  Position,
  NodeProps,
  Edge,
  useReactFlow,
  Node,
  useStore,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { Block, NodeData } from '../../../types';
import { useModalStore } from '../../store/modalStore';
import { useConnectModeStore } from '../../store/connectModeStore';
import { usePathSelectionStore } from '../../store/pathSelectionStore';
import { createPortal } from 'react-dom';
import { useUpdateModeStore } from '../../store/updateModeStore';
import { usePathsStore } from '../../store/pathsStore';
import BlockDetailsSidebar from '../BlockDetailsSidebar';
import { useEditModeStore } from '../../store/editModeStore';
import { useClipboardStore } from '../../store/clipboardStore';
import { useColors } from '@/app/theme/hooks';
import styles from './CustomNode.module.css';

interface CustomNodeProps extends NodeProps {
  data: NodeData & {
    onPreviewUpdate?: (edge: Edge | null) => void;
    // ... other data props
  };
}

function CustomNode({ id, data, selected }: CustomNodeProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const colors = useColors();
  

  const {
    getNodes,
    setEdges,
    setNodes,
    getEdges,
    viewportInitialized,
    setViewport,
    fitView,
  } = useReactFlow();

  const setShowConnectModal = useModalStore(
    (state) => state.setShowConnectModal
  );
  const showConnectModal = useModalStore((state) => state.showConnectModal);
  const connectData = useModalStore((state) => state.connectData);
  const setConnectData = useModalStore((state) => state.setConnectData);
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
    setMergePathId,
    setSelectedEndBlocks,
    setOriginalEndBlocks,
    selectedEndBlocks,
    toggleEndBlockSelection,
    originalEndBlocks,
    triggerPathId,
    setTriggerPathId,
  } = useUpdateModeStore();
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);

  // Get the current zoom level from ReactFlow store
  const zoom = useStore((state) => state.transform[2]);
  const transform = useStore((state) => state.transform);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Add this state near the top of the CustomNode component
  const [showSidebar, setShowSidebar] = useState(false);

  // Add block state to track changes
  const [blockData, setBlockData] = useState(data.block);

  // Add new state for image URL
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const { isEditMode, selectedNodeId } = useEditModeStore();

  const setCopiedBlock = useClipboardStore((state) => state.setCopiedBlock);

  // Add useEffect to fetch signed URL when blockData.image changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (blockData.image) {
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${blockData.image}`
          );
          const data = await response.json();

          if (response.ok && data.signedUrl) {
            setSignedImageUrl(data.signedUrl);
          } else {
            setSignedImageUrl(null);
            setBlockData((prev) => ({ ...prev, image: undefined }));
            // Force re-render by updating node data
            setNodes((nds) =>
              nds.map((node) =>
                node.id === id
                  ? {
                      ...node,
                      data: {
                        ...(node.data as NodeData),
                        block: {
                          ...(node.data as NodeData).block,
                          image: undefined,
                        },
                      },
                    }
                  : node
              )
            );
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
          setSignedImageUrl(null);
          setBlockData((prev) => ({ ...prev, image: undefined }));
          // Force re-render by updating node data
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? {
                    ...node,
                    data: {
                      ...(node.data as NodeData),
                      block: {
                        ...(node.data as NodeData).block,
                        image: undefined,
                      },
                    },
                  }
                : node
            )
          );
        }
      } else {
        setSignedImageUrl(null);
      }
    };

    fetchSignedUrl();
  }, [blockData.image, id, setNodes]);

  // Add the update method to handle all block updates
  const handleBlockUpdate = async (updatedData: Partial<Block>) => {
    try {
      if (updatedData.image === undefined) {
        updatedData.image = blockData.image;
      }
      const blockId = parseInt(id.replace('block-', ''));
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update block');

      const updatedBlock = await response.json();
      console.log('updatedBlock', updatedBlock);

      // Preserve existing image if not explicitly updated
      setBlockData((prev) => ({
        ...prev,
        ...updatedBlock,
        image:
          updatedData.image !== undefined ? updatedBlock.image : prev.image,
      }));

      if (updatedData.title !== undefined) {
        data.label = updatedData.title || 'Untitled Block';
      }

      // Only update paths if image was changed
      if (updatedData.image !== undefined) {
        const updatedPaths = allPaths.map((path) => ({
          ...path,
          blocks: path.blocks.map((block) =>
            block.id === blockId ? { ...block, ...updatedBlock } : block
          ),
        }));

        setAllPaths(updatedPaths);
        data.onPathsUpdate?.(updatedPaths);
      }

      return updatedBlock;
    } catch (error) {
      console.error('Error updating block:', error);
      throw error;
    }
  };

  // Handle highlight effect
  useEffect(() => {
    if (data.highlighted) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [data.highlighted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newPosition = {
        x: rect.right - 170, // 144px is dropdown width
        y: rect.bottom + 4, // 4px offset
      };
      setDropdownPosition(newPosition);
    }
    setShowDropdown(!showDropdown);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(id);
    setShowDropdown(false);
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

  // Check if this is the last STEP node in a path
  const isLastStepInPath =
    data.type === 'STEP' &&
    data.position === (data.path?.blocks.length ?? 0) - 2; // -2 because of END block

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
    isLastStepInPath &&
    parentHasMultipleChildPaths &&
    !data.pathHasChildren &&
    (parentBlockId === null || pathParentBlockId === parentBlockId);

  // Use this condition for both checkbox and dropdown option
  const showCheckbox = mergeMode && canShowMergeUI;

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

  const handleDuplicate = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      setShowDropdown(false);
      const response = await fetch(
        `/api/blocks/${id.replace('block-', '')}/duplicate`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error('Failed to duplicate block');

      const result = await response.json();

      // Update paths with the new data
      setAllPaths(result.paths);
      data.onPathsUpdate?.(result.paths);

      setShowDropdown(false);
    } catch (error) {
      console.error('Error duplicating block:', error);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedBlock(blockData);
    setShowDropdown(false);
  };

  // Add this function to handle copying link
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('blockId', id.replace('block-', ''));
    navigator.clipboard.writeText(url.toString());
    setShowDropdown(false);
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
        <div
          onClick={handleConnectClick}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
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
                Connect node
              </div>
            </div>
          </div>
        </div>

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
              style={{
                '--hover-bg': colors['bg-quaternary']
              } as React.CSSProperties}
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

        {data.pathIsMerged && (
          <div
            onClick={handleUpdateModeActivation}
            className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
          >
            <div 
              style={{
                '--hover-bg': colors['bg-quaternary']
              } as React.CSSProperties}
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
          onClick={handleDuplicate}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/copy-icon.svg`}
                  alt="Duplicate"
                  className="w-4 h-4"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
              >
                Duplicate node
              </div>
            </div>
          </div>
        </div>

        

        <div
          onClick={handleCopy}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/copy-icon.svg`}
                  alt="Copy"
                  className="w-4 h-4"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
              >
                Copy
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={handleCopyLink}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/copy-link-icon.svg`}
                  alt="Copy Link"
                  className="w-4 h-4"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
              >
                Copy Link
              </div>
            </div>
          </div>
        </div>

        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1" 
        />

        <div
          onClick={handleDelete}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
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
                Delete node
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Modify the showUpdateCheckbox logic
  const showUpdateCheckbox = useMemo(() => {
    return (
      isUpdateMode && data.path?.parent_blocks?.[0]?.block_id === triggerPathId
    );
  }, [isUpdateMode, data.path?.parent_blocks, triggerPathId]);

  // Get the end block ID for this path
  const endBlockId = data.path?.blocks.find(
    (block) =>
      block.type === 'END' || block.type === 'LAST' || block.type === 'MERGE'
  )?.id;

  const toggleStrokeLines = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blockId = parseInt(id.replace('block-', ''));
    data.updateStrokeLineVisibility?.(blockId, !data.strokeLinesVisible);
  };

  // Check if this node is the source or target in connect mode
  const isSourceOrTargetNode =
    showConnectModal &&
    (connectData?.sourceNode?.id === id || connectData?.targetNode?.id === id);

  // Add this function to handle zooming to the node
  const zoomToNode = useCallback(() => {
    const node = getNodes().find((n) => n.id === id);
    if (!node) return;

    // Center on node and offset to the left to make room for sidebar
    setViewport(
      {
        x: -(node.position.x - window.innerWidth / 2 + 400),
        y: -(node.position.y - window.innerHeight / 2 + 200),
        zoom: 1,
      },
      { duration: 800 }
    );
  }, [id, getNodes, setViewport]);

  // Modify the click handler to include zooming
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSidebar(true);
    zoomToNode();
  };

  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Add this effect to automatically open the sidebar when the node is selected via edit mode
  useEffect(() => {
    // Check if the current node is the selected node in edit mode
    if (isEditMode && selectedNodeId && `block-${selectedNodeId}` === id) {
      // Automatically open the sidebar
      setShowSidebar(true);
      
      // Only zoom to node if we're not handling a newly created node
      // (The Flow component already handles zooming for new nodes)
      if (viewportInitialized) {
        zoomToNode();
      }
    }
  }, [isEditMode, selectedNodeId, id, zoomToNode, viewportInitialized]);

  return (
    <>
      {/* Vertical Toggle Switch Container */}
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
              onClick={toggleStrokeLines}
              className="cursor-pointer"
              style={{
                width: '12px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: data.strokeLinesVisible
                  ? '#FF69A3'
                  : colors['bg-quaternary'],
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: colors['bg-primary'],
                  position: 'absolute',
                  left: '1px',
                  top: data.strokeLinesVisible ? '1px' : '9px',
                  transition: 'top 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          </div>
        )}

      <div
        className={`relative rounded-lg border-2
        ${isHighlighted ? 'bg-blue-50' : `bg-[${colors['bg-primary']}]`} 
        transition-all duration-300 min-w-[481px] max-w-[481px]
        ${
          (isEditMode && id !== `block-${selectedNodeId}`) ||
          (isConnectMode &&
            id !== connectData?.sourceNode?.id &&
            id !== connectData?.targetNode?.id)
            ? 'opacity-40'
            : ''
        }`}
        onClick={handleNodeClick}
        style={{
          backgroundColor: isHighlighted ? '#EAF4FE' : colors['bg-primary'],
          borderColor: selected ? '#3537cc' : colors['border-secondary']
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

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                border: `1px solid ${colors['border-secondary']}`,
              }}
            >
              {blockData.icon ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${blockData.icon}`}
                  alt="Block Icon"
                  className="w-6 h-6"
                />
              ) : (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
                  alt="Default Icon"
                  className="w-6 h-6"
                />
              )}
            </div>

            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <h3 
                  className="text-sm font-medium"
                  style={{ color: colors['fg-primary'] }}
                >
                  {blockData.title || 'Untitled Block'}
                </h3>
                <button
                  onClick={handleDropdownToggle}
                  className="p-1 rounded-md transition-colors hover:bg-opacity-80"
                  style={{ 
                    color: colors['fg-tertiary'],
                    backgroundColor: 'transparent'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = colors['bg-secondary'];
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                    alt="Menu"
                    className="w-4 h-4"
                  />
                </button>
              </div>

              {blockData.description && (
                <p 
                  className="text-xs mt-1"
                  style={{ color: colors['fg-tertiary'] }}
                >
                  {showFullDescription ? (
                    <>
                      {blockData.description}
                      {blockData.description.length > 50 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullDescription(false);
                          }}
                          className="ml-1 hover:underline"
                          style={{ color: colors['fg-brand-primary'] }}
                        >
                          Show less
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {truncateDescription(blockData.description, 50)}
                      {blockData.description.length > 50 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullDescription(true);
                          }}
                          className="ml-1 hover:underline"
                          style={{ color: colors['fg-brand-primary'] }}
                        >
                          Read more
                        </button>
                      )}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Image with signed URL */}
          {signedImageUrl && (
            <div className="rounded-lg overflow-hidden h-[267px] w-full">
              <img
                src={signedImageUrl}
                alt="Block Media"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Average time - only show if defined */}
          {blockData.average_time && (
            <div className="flex items-center text-xs mt-auto">
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                  color: colors['fg-tertiary'],
                  border: '1px solid',
                }}
              >
                {blockData.average_time} min
              </span>
            </div>
          )}
        </div>

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
                className={`${styles.checkbox}`}
                style={{ 
                  borderColor: colors['border-primary'],
                  '--bg-brand-primary': colors['bg-brand-solid'],
                  '--border-brand': colors['border-brand'],
                  '--bg-secondary': colors['bg-primary']
                } as React.CSSProperties}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-gray-300 dark:text-gray-600">
                {selectedPaths.includes(data.path?.id ?? -1) ? 'Selected' : 'Not selected'}
              </span>
            </div>
          </div>
        )}

        {showUpdateCheckbox && endBlockId && (
          <div className="absolute -top-8 left-0 flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-200">
              <input
                type="checkbox"
                checked={selectedEndBlocks.includes(endBlockId)}
                onChange={() => toggleEndBlockSelection(endBlockId)}
                className={`${styles.checkbox} ${styles.updateCheckbox}`}
                style={{ 
                  borderColor: colors['border-primary'],
                  '--bg-brand-primary': colors['bg-brand-solid'],
                  '--border-brand': colors['border-brand'],
                  '--bg-secondary': colors['bg-primary']
                } as React.CSSProperties}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-gray-300 dark:text-gray-600">
                {selectedEndBlocks.includes(endBlockId) ? 'Selected' : 'Not selected'}
              </span>
            </div>
          </div>
        )}

        {renderDropdown()}
      </div>

      {showSidebar && (
        <BlockDetailsSidebar
          block={blockData}
          onClose={() => setShowSidebar(false)}
          onUpdate={handleBlockUpdate}
        />
      )}
    </>
  );
}

export default CustomNode;
