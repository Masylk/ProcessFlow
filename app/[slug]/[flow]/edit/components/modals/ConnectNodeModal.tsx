import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { createPortal } from 'react-dom';
import { useReactFlow } from '@xyflow/react';
import { useColors } from '@/app/theme/hooks';
// import { PreviewEdgePortal } from './PreviewEdgePortal';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useModalStore } from '../../store/modalStore';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { useIsModalOpenStore } from '@/app/isModalOpenStore';
import { Block, BlockType } from '../../../types';

interface ConnectNodeModalProps {
  onClose: () => void;
  onConfirm: (targetNodeId: string, label: string) => void;
  sourceNode: Node;
  availableNodes: Node[];
  onPreviewUpdate?: (edge: Edge | null) => void;
}

const ConnectNodeModal: React.FC<ConnectNodeModalProps> = ({
  onClose,
  onConfirm,
  sourceNode,
  availableNodes,
  onPreviewUpdate,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [label, setLabel] = useState('');
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

  useEffect(() => {
    setIsModalOpen(true);
    return () => setIsModalOpen(false);
  }, [setIsModalOpen]);

  // Helper function for consistent view options
  const getFitViewOptions = (nodes: Node[]) => ({
    nodes,
    duration: 800,
    padding: 1.2,
    maxZoom: 1.2,
    // Add offset to account for modal width (600px + padding)
    offset: [-(600 + 32), 0], // 600px is modal width, 32px is right padding
  });

  // Initial zoom to source node
  useEffect(() => {
    const node = getNode(sourceNode.id);
    if (node) {
      fitView(getFitViewOptions([node]));
    }
  }, [sourceNode.id, getNode, fitView]);

  // Zoom to both nodes when target is selected
  useEffect(() => {
    if (selectedNodeId) {
      const source = getNode(sourceNode.id);
      const target = getNode(selectedNodeId);
      if (source && target) {
        fitView(getFitViewOptions([source, target]));
      }
    }
  }, [selectedNodeId, sourceNode.id, getNode, fitView]);

  const updatePreview = (previewEdge: Edge | null) => {
    onPreviewUpdate?.(previewEdge);
  };

  useEffect(() => {
    if (selectedNodeId) {
      const edge: Edge = {
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
      };
      setPreviewEdge(edge);
      onPreviewUpdate?.(edge);
    } else {
      setPreviewEdge(null);
      onPreviewUpdate?.(null);
    }
  }, [selectedNodeId, sourceNode.id, onPreviewUpdate, colors]);

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

  // Set focus on label input when moving to step 2
  useEffect(() => {
    if (step === 2) {
      // Use a tiny delay to ensure the DOM is updated
      const timer = setTimeout(() => {
        const labelInput = document.getElementById('connection-label-input');
        if (labelInput) {
          (labelInput as HTMLInputElement).focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

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

  const handleNext = () => {
    if (selectedNodeId) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (selectedNodeId && label.trim()) {
      try {
        setError(null);
        setIsLoading(true);
        await onConfirm(selectedNodeId, label);
        setPreviewEdge(null);
        onPreviewUpdate?.(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setConnectData({
      sourceNode: sourceNode,
      targetNode: getNode(nodeId),
    });

    // Create and set preview edge
    const previewEdge = {
      id: 'preview-edge',
      source: sourceNode.id,
      target: nodeId,
      type: 'strokeEdge',
      data: {
        preview: true,
        isVisible: true,
      },
    };

    setPreviewEdgeId(previewEdge.id);
    updatePreview(previewEdge);
  };

  const clearSelection = () => {
    setTargetBlockId(null);
    setPreviewEdgeId(null);
    setSelectedNodeId('');
    setSearchTerm('');
    updatePreview(null);
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  const handleBlur = () => {
    // Set a small delay before hiding the list
    const timeout = setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
    setBlurTimeout(timeout);
  };

  const handleNodeClick = (nodeId: string) => {
    // Clear the blur timeout if it exists
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }
    setSelectedNodeId(nodeId);
    handleNodeSelect(nodeId);
    setIsInputFocused(false); // Hide list after selection
  };

  const handleChange = (value: string) => {
    setSearchTerm(value);
    // Show loading state briefly for better feedback
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);

    // If there's a value and the dropdown isn't visible, show it
    if (!isInputFocused) {
      setIsInputFocused(true);
    }
  };

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
          {step === 1 ? (
            <div
              className="w-12 h-12 p-3 rounded-[10px] flex items-center justify-center"
              style={{
                backgroundColor: colors['bg-secondary'],
                borderColor: colors['border-light'],
                boxShadow: colors['shadow-sm'],
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`}
                alt="Connect"
                className="w-6 h-6"
              />
            </div>
          ) : (
            <ButtonNormal
              variant="tertiary"
              size="small"
              onClick={() => setStep(1)}
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
            >
              Back
            </ButtonNormal>
          )}
          <h2
            className="text-lg font-medium"
            style={{ color: colors['text-primary'] }}
          >
            {step === 1 ? 'Connect blocks' : ''}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div
                className="text-sm"
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
                          <button
                            onClick={() => {
                              clearSelection();
                            }}
                            style={{ color: colors['text-tertiary'] }}
                            className="hover:text-gray-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: colors['text-tertiary'] }}
                        >
                          #STEP
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
                                      Type to search more nodes
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
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                className="text-sm"
                style={{ color: colors['text-secondary'] }}
              >
                Add a label to that path
              </div>
              <div className="flex flex-col gap-6">
                <div id="connection-label-input">
                  <InputField
                    value={label}
                    onChange={(value) => setLabel(value)}
                    placeholder="Enter a label for this connection"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {error && (
                <div
                  className="p-4 rounded-lg flex items-center gap-3 text-sm"
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
          )}
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{ borderColor: colors['border-secondary'] }}
        >
          <div className="flex gap-2">
            <ButtonNormal
              variant="tertiary"
              onClick={handleClose}
              size="small"
              disabled={isLoading}
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              onClick={step === 1 ? handleNext : handleConfirm}
              disabled={
                step === 1 ? !selectedNodeId : !label.trim() || isLoading
              }
              size="small"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : step === 1 ? (
                'Next'
              ) : (
                'Create connection'
              )}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(
    <ThemeProvider>{modalContent}</ThemeProvider>,
    document.body
  );
};

export default ConnectNodeModal;
