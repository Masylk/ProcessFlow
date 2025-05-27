import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { createPortal } from 'react-dom';
import { useReactFlow } from '@xyflow/react';
import { useColors } from '@/app/theme/hooks';
// import { PreviewEdgePortal } from './PreviewEdgePortal';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useModalStore } from '../../store/modalStore';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
// No longer need separate ThemeProvider for modals
import { useIsModalOpenStore } from '@/app/isModalOpenStore';
import { Block, BlockType, NodeData } from '../../../types';
import Modal from '@/app/components/Modal';
import { updateStrokeLine } from '../../utils/stroke-lines';

interface ConnectNodeModalProps {
  onClose: () => void;
  onConfirm: (targetNodeId: string, label: string) => void;
  sourceNode: Node;
  availableNodes: Node[];
  onPreviewUpdate?: (edge: Edge | null) => void;
  initialTargetNodeId?: string;
  initialLabel?: string;
  editStrokeLineId?: string;
  isEdit?: boolean;
  onLinkUpdated?: (updatedStrokeLine: any) => void;
}

const ConnectNodeModal: React.FC<ConnectNodeModalProps> = ({
  onClose,
  onConfirm,
  sourceNode,
  availableNodes,
  onPreviewUpdate,
  initialTargetNodeId,
  initialLabel,
  editStrokeLineId,
  isEdit,
  onLinkUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(initialTargetNodeId || '');
  const [label, setLabel] = useState(initialLabel || '');
  const { fitView, getNode } = useReactFlow();
  const colors = useColors();
  const [previewEdge, setPreviewEdge] = useState<Edge | null>(null);
  const { setTargetBlockId, setPreviewEdgeId } = useConnectModeStore();
  const setConnectData = useModalStore((state) => state.setConnectData);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [blurTimeout, setBlurTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>(
    'bottom'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setIsModalOpen = useIsModalOpenStore((state) => state.setIsModalOpen);
  const [originalTargetNodeId] = useState(initialTargetNodeId || '');
  const [originalLabel] = useState(initialLabel || '');
  
  // Add ref to prevent cascading updates
  const isUpdatingPreview = useRef(false);

  useEffect(() => {
    setIsModalOpen(true);
    return () => setIsModalOpen(false);
  }, [setIsModalOpen]);

  // Helper function for consistent view options
  const getFitViewOptions = useCallback((nodes: Node[]) => ({
    nodes,
    duration: 800,
    padding: 1.2,
    maxZoom: 1.2,
    // Add offset to account for modal width (600px + padding)
    offset: [-(600 + 32), 0], // 600px is modal width, 32px is right padding
  }), []);

  // Memoize the preview edge to prevent unnecessary recreations
  const memoizedPreviewEdge = useMemo(() => {
    if (!selectedNodeId) return null;
    
    return {
      id: 'preview-edge',
      source: sourceNode.id,
      target: selectedNodeId,
      type: 'strokeEdge',
      sourceHandle: 'stroke_source',
      targetHandle:
        selectedNodeId === sourceNode.id
          ? 'stroke_self_target'
          : 'stroke_target',
      style: {
        opacity: 1,
        stroke: colors['accent-primary'],
        strokeWidth: 3,
        strokeDasharray: '5,5',
        zIndex: 9999,
      },
      animated: true,
      data: {
        source: sourceNode.id,
        target: selectedNodeId,
        preview: true,
        isVisible: true,
      },
      zIndex: 9999,
    } as Edge;
  }, [selectedNodeId, sourceNode.id, colors]);

  // Stable update preview function
  const updatePreview = useCallback((edge: Edge | null) => {
    if (isUpdatingPreview.current) return;
    isUpdatingPreview.current = true;
    
    try {
      onPreviewUpdate?.(edge);
    } finally {
      // Reset the flag after a brief delay to allow the update to complete
      setTimeout(() => {
        isUpdatingPreview.current = false;
      }, 0);
    }
  }, [onPreviewUpdate]);

  // Initial zoom to source node - only run once
  useEffect(() => {
    const node = getNode(sourceNode.id);
    if (node) {
      fitView(getFitViewOptions([node]));
    }
  }, [sourceNode.id]); // Removed getNode and fitView from dependencies to prevent re-runs

  // Zoom to both nodes when target is selected - debounced
  useEffect(() => {
    if (!selectedNodeId) return;
    
    const timeoutId = setTimeout(() => {
      const source = getNode(sourceNode.id);
      const target = getNode(selectedNodeId);
      if (source && target) {
        fitView(getFitViewOptions([source, target]));
      }
    }, 100); // Small debounce to prevent rapid calls

    return () => clearTimeout(timeoutId);
  }, [selectedNodeId, sourceNode.id]); // Removed getNode and fitView from dependencies

  // Update preview edge - optimized to prevent infinite loops
  useEffect(() => {
    if (isUpdatingPreview.current) return;
    
    setPreviewEdge(memoizedPreviewEdge);
    updatePreview(memoizedPreviewEdge);
  }, [memoizedPreviewEdge, updatePreview]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Element)
      ) {
        setIsInputFocused(false);
      }
    };

    if (isInputFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInputFocused]);

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isInputFocused && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const requiredSpace = 240; // max-height of dropdown

      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isInputFocused]);

  const filteredNodes = availableNodes.filter(
    (node) =>
      // Only include STEP type nodes
      (node.data.type === 'STEP' ||
        node.data.type === 'DELAY' ||
        node.data.type === 'PATH') &&
      ((typeof node.data.label === 'string' &&
        node.data.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
        `Block ${node.data.position}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirm = useCallback(async () => {
    if (selectedNodeId && label.trim()) {
      try {
        setError(null);
        setIsLoading(true);
        if (isEdit && editStrokeLineId) {
          // Update existing stroke line
          const nodeData = sourceNode.data as NodeData;
          const workflowId = nodeData.path?.workflow_id;
          if (!workflowId) {
            setError('Workflow ID is missing from source node');
            setIsLoading(false);
            return;
          }
          const updated = await updateStrokeLine({
            id: parseInt(editStrokeLineId.replace('stroke-edge-', '')),
            source_block_id: parseInt(sourceNode.id.replace('block-', '')),
            target_block_id: parseInt(selectedNodeId.replace('block-', '')),
            workflow_id: workflowId,
            label: label,
          });
          if (!updated) throw new Error('Failed to update link');
          if (onLinkUpdated) onLinkUpdated(updated);
          onClose(); // Close modal after successful update
        } else {
          await onConfirm(selectedNodeId, label);
        }
        setPreviewEdge(null);
        updatePreview(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedNodeId, label, isEdit, editStrokeLineId, sourceNode, onLinkUpdated, onClose, onConfirm, updatePreview]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    // Batch state updates to prevent cascading re-renders
    setSelectedNodeId(nodeId);
    
    // Set connect data
    const targetNode = getNode(nodeId);
    if (targetNode) {
      setConnectData({
        sourceNode: sourceNode,
        targetNode: targetNode,
      });
    }

    // Set preview edge ID for the store
    setPreviewEdgeId('preview-edge');
    
    // The preview edge will be automatically created by the memoizedPreviewEdge useMemo
    // and updated by the useEffect, so we don't need to manually create it here
  }, [getNode, sourceNode, setConnectData, setPreviewEdgeId]);

  const clearSelection = useCallback(() => {
    setTargetBlockId(null);
    setPreviewEdgeId(null);
    setSelectedNodeId('');
    setSearchTerm('');
    // The preview will be automatically cleared by the useEffect when selectedNodeId becomes empty
  }, [setTargetBlockId, setPreviewEdgeId]);

  const handleClose = useCallback(() => {
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  const handleBlur = useCallback(() => {
    // Set a small delay before hiding the list
    const timeout = setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
    setBlurTimeout(timeout);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Clear the blur timeout if it exists
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }
    handleNodeSelect(nodeId);
    setIsInputFocused(false); // Hide list after selection
  }, [blurTimeout, handleNodeSelect]);

  const handleChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Only show loading state for longer searches
    if (value.length > 2) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 200);
    }

    // If there's a value and the dropdown isn't visible, show it
    if (!isInputFocused) {
      setIsInputFocused(true);
    }
  }, [isInputFocused]);

  // Helper function to get icon URL based on node type
  const getNodeTypeIcon = (type: string): string => {
    switch (type) {
      case 'STEP':
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-commit.svg`;
      case 'PATH':
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-04.svg`;
      case 'DELAY':
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`;
      default:
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-icon.svg`;
    }
  };

  const modalContent = (
    <>
      {/* <PreviewEdgePortal edge={previewEdge} /> */}
      {/* Semi-transparent overlay */}
      {/* <div
        className="fixed inset-0 bg-black bg-opacity-0 z-40"
        onClick={handleClose}
      /> */}
      {/* Modal - keep high z-index */}
      <div
        className="fixed bottom-20 right-8 w-[600px] rounded-xl shadow-lg z-50 border"
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary'],
        }}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 pt-6 pb-6 border-b"
          style={{ borderColor: colors['border-secondary'] }}
        >
          <div
            className="w-12 h-12 p-3 rounded-[10px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border justify-center items-center inline-flex overflow-hidden"
            style={{
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary'],
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`}
              alt="Connect blocks"
              className="w-6 h-6"
            />
          </div>
          <h2
            className="text-lg font-medium"
            style={{ color: colors['text-primary'] }}
          >
            Create a path to a block
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div
              className="text-sm font-semibold"
              style={{ color: colors['text-secondary'] }}
            >
              Select Block
            </div>

            {/* Two Column Layout */}
            <div className="flex justify-end">
              <div className="flex gap-0">
                {/* Connection Line Image Column */}
                <div className="w-4 flex-shrink-0 relative">
                  <div className="absolute top-[60px] bottom-[60px]">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-line.svg`}
                      alt="Connection line"
                      className="h-full w-full object-fill"
                    />
                    {/* Check Icon */}
                    <div className="absolute left-[0.4px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-white.svg`}
                        alt="Check"
                        className="w-3 h-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Nodes Column */}
                <div className="w-[450px] flex flex-col gap-6">
                  {/* Source Block */}
                  <div
                    className="w-full p-4 rounded-lg"
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-light'],
                      border: `1px solid ${colors['border-light']}`,
                    }}
                  >
                    <div
                      className="text-sm mb-2"
                      style={{ color: colors['text-secondary'] }}
                    >
                      Node 1
                    </div>
                    <div
                      className="text-xs mb-1"
                      style={{ color: colors['text-tertiary'] }}
                    >
                      #{(sourceNode.data.block as Block).type}
                    </div>
                    <div
                      className="text-sm font-medium break-words line-clamp-2"
                      style={{ color: colors['text-primary'] }}
                    >
                      {sourceNode.data.label as string}
                    </div>
                  </div>

                  {/* Target Block */}
                  {selectedNodeId ? (
                    <div
                      className="w-full p-4 rounded-lg"
                      style={{
                        backgroundColor: colors['bg-secondary'],
                        borderColor: colors['border-light'],
                        border: `1px solid ${colors['border-light']}`,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className="text-sm"
                          style={{ color: colors['text-secondary'] }}
                        >
                          Node 2
                        </div>
                        <ButtonNormal
                          onClick={() => {
                            clearSelection();
                          }}
                          variant="tertiary"
                          iconOnly
                          size="small"
                          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        />
                      </div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: colors['text-tertiary'] }}
                      >
                        #{(getNode(selectedNodeId)?.data.block as Block).type}
                      </div>
                      <div
                        className="text-sm font-medium break-words line-clamp-2"
                        style={{ color: colors['text-primary'] }}
                      >
                        {getNode(selectedNodeId)?.data.label as string}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full p-4 rounded-lg"
                      style={{
                        backgroundColor: colors['bg-secondary'],
                        borderColor: colors['border-light'],
                        border: `1px solid ${colors['border-light']}`,
                      }}
                    >
                      <div
                        className="text-sm mb-2"
                        style={{ color: colors['text-secondary'] }}
                      >
                        Node 2
                      </div>
                      <div className="relative" ref={dropdownRef}>
                        <div
                          className="cursor-pointer"
                          onClick={() => setIsInputFocused(true)}
                          ref={inputRef}
                        >
                          <InputField
                            type="icon-leading"
                            iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
                            value={searchTerm}
                            onChange={handleChange}
                            placeholder="Search for a node..."
                          />
                        </div>

                        <div
                          className="flex items-center gap-2 absolute right-2 top-2.5 z-50 cursor-pointer transition-transform duration-200"
                          style={{
                            transform: isInputFocused
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          }}
                          onClick={() => setIsInputFocused(!isInputFocused)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke={colors['text-tertiary']}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {/* Search list with improved UX */}
                        {isInputFocused && (
                          <div
                            className={`absolute left-0 right-0 rounded-lg shadow-lg max-h-[240px] overflow-y-auto z-10 transition-all duration-200 ease-in-out border py-1 ${
                              dropdownPosition === 'top'
                                ? 'bottom-[calc(100%_+_5px)]'
                                : 'top-[calc(100%_+_5px)]'
                            }`}
                            style={{
                              backgroundColor: colors['bg-secondary'],
                              borderColor: colors['border-secondary'],
                              animation: 'fadeIn 0.2s ease-out',
                            }}
                          >
                            {isLoading ? (
                              <div className="p-4 text-sm text-center flex items-center justify-center">
                                <div
                                  className="w-5 h-5 border-2 rounded-full border-t-transparent animate-spin mr-2"
                                  style={{
                                    borderColor: `${colors['accent-primary']} transparent ${colors['accent-primary']} ${colors['accent-primary']}`,
                                  }}
                                ></div>
                                <span
                                  style={{ color: colors['text-secondary'] }}
                                >
                                  Searching...
                                </span>
                              </div>
                            ) : filteredNodes.length > 0 ? (
                              filteredNodes.map((node) => (
                                <button
                                  key={node.id}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur from firing before click
                                    handleNodeClick(node.id);
                                  }}
                                  className="w-full text-left text-sm transition-colors flex items-center justify-between p-[1px] px-[6px]"
                                  style={{
                                    color: colors['text-primary'],
                                    backgroundColor:
                                      selectedNodeId === node.id
                                        ? `${colors['accent-primary']}15`
                                        : 'transparent',
                                  }}
                                  onMouseOver={(e) => {
                                    if (selectedNodeId !== node.id) {
                                      const innerDiv =
                                        e.currentTarget.querySelector('div');
                                      if (innerDiv) {
                                        innerDiv.style.backgroundColor =
                                          colors['bg-tertiary'];
                                      }
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (selectedNodeId !== node.id) {
                                      const innerDiv =
                                        e.currentTarget.querySelector('div');
                                      if (innerDiv) {
                                        innerDiv.style.backgroundColor =
                                          'transparent';
                                      }
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2 w-full rounded-[6px] py-[10px] px-[10px] pl-[8px]">
                                    <div className="w-5 h-5 flex-shrink-0">
                                      <img
                                        src={getNodeTypeIcon(
                                          node.data.type as string
                                        )}
                                        alt={`${node.data.type} icon`}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="text-sm font-medium">
                                      {node.data.label as string}
                                    </div>
                                    {selectedNodeId === node.id && (
                                      <div className="ml-auto">
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke={colors['accent-primary']}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : searchTerm ? (
                              <div
                                className="p-6 text-sm text-center flex flex-col items-center justify-center gap-2"
                                style={{ color: colors['text-tertiary'] }}
                              >
                                <svg
                                  className="w-6 h-6 mb-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke={colors['text-tertiary']}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                                <span>No matching nodes found</span>
                                <span className="text-xs opacity-80">
                                  Try a different search term
                                </span>
                              </div>
                            ) : (
                              <div className="p-4 text-sm">
                                {availableNodes
                                  .filter((node) => node.data.type === 'STEP')
                                  .slice(0, 5)
                                  .map((node) => (
                                    <button
                                      key={node.id}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleNodeClick(node.id);
                                      }}
                                      className="w-full text-left text-sm transition-colors flex items-center justify-between p-[1px] px-[6px]"
                                      style={{
                                        color: colors['text-primary'],
                                      }}
                                      onMouseOver={(e) => {
                                        const innerDiv =
                                          e.currentTarget.querySelector(
                                            'div'
                                          );
                                        if (innerDiv) {
                                          innerDiv.style.backgroundColor =
                                            colors['bg-tertiary'];
                                        }
                                      }}
                                      onMouseOut={(e) => {
                                        const innerDiv =
                                          e.currentTarget.querySelector(
                                            'div'
                                          );
                                        if (innerDiv) {
                                          innerDiv.style.backgroundColor =
                                            'transparent';
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-2 w-full rounded-[6px] py-[10px] px-[10px] pl-[8px]">
                                        <div className="w-5 h-5 flex-shrink-0">
                                          <img
                                            src={getNodeTypeIcon(
                                              node.data.type as string
                                            )}
                                            alt={`${node.data.type} icon`}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                        <div className="text-sm font-medium">
                                          {node.data.label as string}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                {availableNodes.filter(
                                  (node) => node.data.type === 'STEP'
                                ).length > 5 && (
                                  <div
                                    className="px-4 py-2 text-xs text-center"
                                    style={{ color: colors['text-tertiary'] }}
                                  >
                                    Type to search more blocks
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Link Name Input - Added here */}
            <div className="mt-6">
              <div className="flex items-center gap-1 mb-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: colors['text-secondary'] }}
                >
                  Link name
                </label>
                <span style={{ color: colors['accent-primary'] }}>*</span>
              </div>
              <InputField
                value={label}
                onChange={(value) => setLabel(value)}
                placeholder="Enter a label for this connection"
              />
            </div>
          </div>

          {error && (
            <div
              className="p-4 rounded-lg flex items-center gap-3 text-sm mt-4"
              style={{
                backgroundColor: `${colors['error-primary']}15`,
                color: colors['error-primary'],
                border: `1px solid ${colors['error-primary']}25`,
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span style={{ color: colors['error-primary'] }}>
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{ borderColor: colors['border-secondary'] }}
        >
          <div className="flex gap-2">
            <ButtonNormal
              variant="secondary"
              onClick={handleClose}
              size="small"
              disabled={isLoading}
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              onClick={handleConfirm}
              disabled={
                !selectedNodeId || !label.trim() || isLoading ||
                (isEdit && selectedNodeId === originalTargetNodeId && label === originalLabel)
              }
              size="small"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEdit ? 'Update link' : 'Create link'
              )}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(
    modalContent,
    document.body
  );
};

export default ConnectNodeModal;
