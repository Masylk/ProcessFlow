import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { createPortal } from 'react-dom';
import { useReactFlow } from '@xyflow/react';
import { useColors } from '@/app/theme/hooks';
import { PreviewEdgePortal } from './PreviewEdgePortal';

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

  const updatePreview = (previewEdge: Edge) => {
    console.log('updatePreview', onPreviewUpdate);
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
          stroke: '#FF1493',
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
  }, [selectedNodeId, sourceNode.id, onPreviewUpdate]);

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

  const filteredNodes = availableNodes.filter(
    (node) =>
      // Only include STEP type nodes
      node.data.type === 'STEP' &&
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

  const handleConfirm = () => {
    if (selectedNodeId && label.trim()) {
      onConfirm(selectedNodeId, label);
    }
  };

  const handleNodeSelect = (targetNodeId: string) => {
    console.log('handleNodeSelect', targetNodeId);
    // Creates a temporary preview edge
    const previewEdge = {
      id: 'preview-edge',
      source: sourceNode.id,
      target: targetNodeId,
      type: 'strokeEdge',
      data: {
        preview: true, // This marks it as a preview
        isVisible: true,
      },
    };

    // Adds this preview edge to the edges
    updatePreview(previewEdge);
  };

  const modalContent = (
    <>
      <PreviewEdgePortal edge={previewEdge} />
      {/* Modal - keep high z-index */}
      <div
        className="fixed bottom-8 right-8 w-[600px] rounded-xl shadow-lg z-50"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6">
          {step === 1 ? (
            <div className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
                alt="Connect"
                className="w-6 h-6"
              />
            </div>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-600"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                alt="Back"
                className="w-5 h-5"
              />
              <span className="text-sm text-[#475467]">Back</span>
            </button>
          )}
          <h2 className="text-lg font-semibold">
            {step === 1 ? 'Create a path to a node' : ''}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-600">Select Node</div>

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
                    <div className="w-full p-4 bg-white border rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Node 1</div>
                      <div className="text-xs text-gray-500 mb-1">#STEP</div>
                      <div className="text-sm font-medium">
                        {sourceNode.data.label as string}
                      </div>
                    </div>

                    {/* Target Block */}
                    {selectedNodeId ? (
                      <div className="w-full p-4 bg-white border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-600">Node 2</div>
                          <button
                            onClick={() => {
                              setSelectedNodeId('');
                              setSearchTerm('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
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
                        <div className="text-xs text-gray-500 mb-1">#STEP</div>
                        <div className="text-sm font-medium">
                          {getNode(selectedNodeId)?.data.label as string}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-4 bg-white border rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Node 2</div>
                        <div className="relative">
                          <div className="flex items-center gap-2 text-gray-500 p-2 border border-[#D0D5DD] rounded-lg">
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <input
                              type="text"
                              id="searchInput"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search nodes & select"
                              className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-500"
                            />
                          </div>

                          {/* Search list - Adjusted positioning */}
                          {searchTerm && (
                            <div className="absolute left-0 right-0 top-[calc(100%_-_1px)] border rounded-b-lg bg-white shadow-lg max-h-[240px] overflow-y-auto z-10">
                              {filteredNodes.map((node) => (
                                <button
                                  key={node.id}
                                  onClick={() => {
                                    setSelectedNodeId(node.id);
                                    handleNodeSelect(node.id);
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b last:border-b-0"
                                >
                                  {node.data.label as string}
                                </button>
                              ))}
                              {filteredNodes.length === 0 && (
                                <div className="p-4 text-sm text-gray-500 text-center">
                                  No matching nodes found
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
              <div className="text-sm text-gray-600">
                Add a label to that path
              </div>
              <div className="flex flex-col gap-6">
                <div className="w-full p-4 bg-white rounded-lg">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Enter a label for this connection"
                    className="w-full px-3 py-2 border rounded text-sm"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={step === 1 ? handleNext : handleConfirm}
            disabled={step === 1 ? !selectedNodeId : !label.trim()}
            className={`px-6 py-2 text-sm text-white rounded ${
              (step === 1 ? !selectedNodeId : !label.trim())
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {step === 1 ? 'Next' : 'Create connection'}
          </button>
        </div>
      </div>
    </>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default ConnectNodeModal;
