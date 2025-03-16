import React, { useEffect, useState, useCallback } from 'react';
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
import { Block, NodeData } from '../../types';
import { useModalStore } from '../../store/modalStore';
import { useConnectModeStore } from '../../store/connectModeStore';
import { usePathSelectionStore } from '../../store/pathSelectionStore';
import { createPortal } from 'react-dom';
import { useUpdateModeStore } from '../../store/updateModeStore';
import { usePathsStore } from '../../store/pathsStore';
import BlockDetailsSidebar from '../BlockDetailsSidebar';

interface CustomNodeProps extends NodeProps {
  data: NodeData & {
    onPreviewUpdate?: (edge: Edge | null) => void;
    // ... other data props
  };
}

function CustomNode({ id, data, selected }: CustomNodeProps) {
  // console.log(`Node ${id} pathHasChildren:`, data.pathHasChildren);

  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
  } = useUpdateModeStore();
  const allPaths = usePathsStore((state) => state.paths);

  // Get the current zoom level from ReactFlow store
  const zoom = useStore((state) => state.transform[2]);
  const transform = useStore((state) => state.transform);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Add this state near the top of the CustomNode component
  const [showSidebar, setShowSidebar] = useState(false);

  // Add block state to track changes
  const [blockData, setBlockData] = useState(data.block);

  // Handler for block updates
  const handleBlockUpdate = (updatedData: Partial<Block>) => {
    const newBlockData = {
      ...blockData,
      ...updatedData,
    };
    setBlockData(newBlockData);

    // Update the node label if title changes
    if (updatedData.title !== undefined) {
      data.label = updatedData.title || 'Untitled Block';
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
        x: rect.right - 144, // 144px is dropdown width
        y: rect.bottom + 4, // 4px offset
      };
      console.log('Dropdown position:', {
        rect,
        zoom,
        transform,
        calculatedPosition: newPosition,
      });
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
    // Find the merge block in the current path
    const mergeBlock = data.path?.blocks.find(
      (block) => block.type === 'MERGE'
    );

    if (!mergeBlock || !mergeBlock.child_paths[0]) {
      console.error('No merge block or child path found');
      return;
    }

    // Get the merge path (child path of merge block)
    const mergePathId = mergeBlock.child_paths[0].path_id;
    const mergePath = allPaths.find((path) => path.id === mergePathId);

    if (!mergePath) {
      console.error('Merge path not found');
      return;
    }

    // Get the parent blocks from the merge path
    const parentBlocks = mergePath.parent_blocks.map((pb) => pb.block_id);

    console.log('Update mode activation:', {
      mergeBlock,
      mergePathId,
      mergePath,
      parentBlocks,
    });

    setUpdateMode(true);
    setMergePathId(mergePathId);
    setSelectedEndBlocks(parentBlocks);
    setOriginalEndBlocks(parentBlocks);
  };

  const renderDropdown = () => {
    if (!showDropdown) return null;

    return createPortal(
      <div
        className="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1"
        style={{
          left: dropdownPosition.x,
          top: dropdownPosition.y,
          width: '144px',
          zIndex: 99999999,
        }}
      >
        <button
          onClick={handleConnectClick}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Connect node
        </button>
        {canShowMergeUI && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMergeMode(true);
              // Auto-select the current node
              togglePathSelection(
                data.path?.id ?? -1,
                endBlock?.id ?? -1,
                pathParentBlockId ?? -1
              );
              setShowDropdown(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Merge paths
          </button>
        )}
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
        >
          Delete node
        </button>
        {data.pathIsMerged && (
          <button
            onClick={handleUpdateModeActivation}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Update merge
          </button>
        )}
      </div>,
      document.body
    );
  };

  // Show update mode checkbox
  const showUpdateCheckbox =
    isUpdateMode &&
    ((isLastStepInPath &&
      parentHasMultipleChildPaths &&
      !data.pathHasChildren) ||
      data.path?.blocks.some((block) => originalEndBlocks.includes(block.id)));

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

    const adjustedNode = {
      ...node,
      position: {
        y: node.position.y + 1000,
        x: node.position.x + 2000, // Move 200px to the right
      },
    };
    fitView({
      nodes: [adjustedNode],
      duration: 800,
      padding: 1,
      minZoom: 0.4,
      maxZoom: 1.5,
    });
  }, [id, getNodes, fitView]);

  // Modify the click handler to include zooming
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSidebar(true);
    zoomToNode();
  };

  return (
    <>
      {/* Vertical Toggle Switch Container */}
      {getEdges().some(
        (edge) => edge.source === id && edge.type === 'strokeEdge'
      ) &&
        !showConnectModal && (
          <div
            className="absolute top-[20px] -translate-y-1/2 transition-opacity duration-300"
            style={{
              left: '-20px',
              backgroundColor: '#FFFFFF',
              padding: '4px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
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
                  : '#E5E7EB',
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
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
        className={`relative transition-all duration-300 ${
          isHighlighted ? 'scale-110' : ''
        }`}
      >
        <div
          className={`relative rounded-lg border ${
            selected ? 'border-blue-400' : 'border-gray-200'
          } bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${
            showConnectModal && !isSourceOrTargetNode ? 'opacity-40' : ''
          }`}
          style={{
            width: '481px',
            minHeight: '120px',
            padding: '16px',
          }}
          onClick={handleNodeClick}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 8,
              height: 8,
              opacity: 0,
              background: '#60a5fa',
              border: '2px solid white',
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
              background: '#b1b1b7',
              border: '2px solid white',
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
              background: '#b1b1b7',
              border: '2px solid white',
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
              background: '#b1b1b7',
              border: '2px solid white',
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
              background: '#60a5fa',
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm text-gray-500">
              Position: {data.position}
            </div>
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                  alt="Menu"
                  className="w-5 h-5"
                />
              </button>
              {renderDropdown()}
            </div>
          </div>
          <div className="text-gray-900">{data.label}</div>
        </div>

        {showCheckbox && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
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
              className="w-4 h-4 rounded border-gray-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {showUpdateCheckbox && endBlockId && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <input
              type="checkbox"
              checked={selectedEndBlocks.includes(endBlockId)}
              onChange={() => toggleEndBlockSelection(endBlockId)}
              className="w-4 h-4 rounded border-gray-300 bg-blue-100"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
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
