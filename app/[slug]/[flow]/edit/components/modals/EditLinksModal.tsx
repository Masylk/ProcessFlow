'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
import { Node as FlowNodeType, Edge, useReactFlow } from '@xyflow/react';
import { useModalStore } from '../../store/modalStore';
import ButtonNormal from '@/app/components/ButtonNormal';
import { Node as FlowNode } from '@xyflow/react';
import { NodeData, Block } from '../../../types';
import { deleteStrokeLine } from '../../utils/stroke-lines';
import ConnectNodeModal from './ConnectNodeModal';
import { handleToggleEndpoint } from '../../utils/toggleEndpoint';
import { usePathsStore } from '../../store/pathsStore';

interface EditLinksModalProps {
  isVisible?: boolean;
  onEditLink?: (
    sourceNode: FlowNodeType<NodeData>,
    targetNode: FlowNodeType<NodeData>,
    label: string,
    strokeLineId?: string
  ) => void;
}

const EditLinksModal: React.FC<EditLinksModalProps> = ({
  isVisible = true,
  onEditLink,
}) => {
  const colors = useColors();
  const {
    showEditLinksModal,
    editLinksData,
    setShowEditLinksModal,
    setConnectData,
    setShowConnectModal,
    setEditLinksData,
  } = useModalStore((state) => ({
    showEditLinksModal: state.showEditLinksModal,
    editLinksData: state.editLinksData,
    setShowEditLinksModal: state.setShowEditLinksModal,
    setConnectData: state.setConnectData,
    setShowConnectModal: state.setShowConnectModal,
    setEditLinksData: state.setEditLinksData,
  }));

  const { getEdges, getNode, setEdges } = useReactFlow();
  const [isDirectionToggled, setIsDirectionToggled] = useState(false);
  const [links, setLinks] = useState<Edge[]>([]);
  const [sourceBlock, setSourceBlock] = useState<FlowNodeType<NodeData> | null>(
    null
  );
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dotsRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [menuPosition, setMenuPosition] = useState<{
    [key: string]: 'bottom' | 'top';
  }>({});
  const menuOptionRefs = useRef<{
    [key: string]: (HTMLButtonElement | null)[];
  }>({});
  const [hoveredDotsId, setHoveredDotsId] = useState<string | null>(null);
  const [showConnectNodeModal, setShowConnectNodeModal] = useState(false);
  const [connectModalSourceNode, setConnectModalSourceNode] =
    useState<FlowNodeType<NodeData> | null>(null);
  const [connectModalTargetNode, setConnectModalTargetNode] =
    useState<FlowNodeType<NodeData> | null>(null);
  const [connectModalLabel, setConnectModalLabel] = useState<string>('');

  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);

  // Load data when modal opens
  useEffect(() => {
    if (showEditLinksModal && editLinksData?.sourceNode) {
      // Get the source node
      setSourceBlock(editLinksData.sourceNode as FlowNodeType<NodeData>);

      // Get all stroke edges where this node is the source
      const strokeEdges = getEdges().filter(
        (edge) =>
          edge.source === editLinksData.sourceNode.id &&
          edge.type === 'strokeEdge'
      );

      setLinks(strokeEdges);

      // Set toggle state based on is_endpoint
      const isEndpoint =
        editLinksData.sourceNode.data?.block?.is_endpoint === true;
      setIsDirectionToggled(isEndpoint);
    }
  }, [showEditLinksModal, editLinksData, getEdges]);

  // Keep toggle in sync with sourceBlock.is_endpoint if sourceBlock changes
  useEffect(() => {
    if (sourceBlock?.data?.block) {
      setIsDirectionToggled(!!sourceBlock.data.block.is_endpoint);
    }
  }, [sourceBlock]);

  // Close menu on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      if (openMenuId && menuRefs.current[openMenuId]) {
        const targetNode = e.target;
        const menuRef = menuRefs.current[openMenuId];
        const dotsRef = dotsRefs.current[openMenuId];
        if (
          targetNode instanceof Node &&
          (!menuRef || !menuRef.contains(targetNode)) &&
          (!dotsRef || !dotsRef.contains(targetNode))
        ) {
          setOpenMenuId(null);
        }
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClick as EventListener);
    document.addEventListener('touchstart', handleClick as EventListener);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick as EventListener);
      document.removeEventListener('touchstart', handleClick as EventListener);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenuId]);

  // Menu positioning (above or below)
  const handleMenuOpen = (linkId: string, idx: number) => {
    setOpenMenuId(linkId);
    setTimeout(() => {
      if (idx === 0) {
        setMenuPosition((prev) => ({ ...prev, [linkId]: 'bottom' }));
      } else {
        setMenuPosition((prev) => ({ ...prev, [linkId]: 'top' }));
      }
    }, 0);
  };

  // Keyboard navigation for menu
  const handleMenuKeyDown = (
    e: React.KeyboardEvent,
    linkId: string,
    optionIdx: number
  ) => {
    const options = menuOptionRefs.current[linkId];
    if (!options) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (optionIdx + 1) % options.length;
      options[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (optionIdx - 1 + options.length) % options.length;
      options[prev]?.focus();
    } else if (e.key === 'Tab') {
      setOpenMenuId(null);
    }
  };

  // Edit and delete handlers
  const handleEditLink = (link: Edge) => {
    const sourceNode = getNode(link.source) as FlowNodeType<NodeData> | null;
    const targetNode = getNode(link.target) as FlowNodeType<NodeData> | null;
    if (sourceNode && targetNode && onEditLink) {
      onEditLink(
        sourceNode,
        targetNode,
        typeof link.data?.label === 'string' ? link.data.label : '',
        link.id
      );
    }
    setOpenMenuId(null);
  };
  const handleDeleteLink = async (link: Edge) => {
    // Extract stroke line ID from edge ID
    const strokeLineId = link.id.replace('stroke-edge-', '');
    const deleted = await deleteStrokeLine(Number(strokeLineId));
    if (!deleted) return; // If backend deletion fails, do not update UI

    // Remove the link from local state
    const { onStrokeLinesUpdate } = useModalStore.getState();
    if (onStrokeLinesUpdate) {
      onStrokeLinesUpdate((prev) =>
        prev.filter((l) => l.id !== Number(strokeLineId))
      );
    }
    setEdges((prev) => prev.filter((l) => l.id !== link.id));
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    setOpenMenuId(null);

    // --- NEW LOGIC: Check if the source block has any other outgoing stroke lines ---
    if (sourceBlock?.id) {
      // Get all remaining stroke edges for this source
      const remainingEdges = getEdges().filter(
        (edge) =>
          edge.source === sourceBlock.id &&
          edge.type === 'strokeEdge' &&
          edge.id !== link.id // Exclude the just-deleted one
      );
      if (remainingEdges.length === 0) {
        // No more outgoing stroke lines, update is_endpoint in allPaths
        const blockId = sourceBlock.data.block.id;
        const updatedPaths = allPaths.map((path) => ({
          ...path,
          blocks: path.blocks.map((block) =>
            block.id === blockId ? { ...block, is_endpoint: false } : block
          ),
        }));
        setAllPaths(updatedPaths);
        if (sourceBlock.data.onPathsUpdate) {
          sourceBlock.data.onPathsUpdate(updatedPaths);
        }

        // Also update local UI state
        setSourceBlock((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  block: {
                    ...prev.data.block,
                    is_endpoint: false,
                  },
                },
              }
            : prev
        );
        setIsDirectionToggled(false);
      }
    }
    // --- END NEW LOGIC ---
  };

  const handleClose = () => {
    setShowEditLinksModal(false);
  };

  const handleToggleDirection = async () => {
    if (!sourceBlock?.data?.block?.id) return;
    const newValue = !isDirectionToggled;

    // Call the util and only update UI if fetch succeeded
    try {
      await handleToggleEndpoint(
        sourceBlock.data.block.id,
        newValue,
        allPaths,
        setAllPaths,
        sourceBlock.data.onPathsUpdate
      );
      setIsDirectionToggled(newValue);
      // Optionally update sourceBlock's is_endpoint in local state
      setSourceBlock((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                block: {
                  ...prev.data.block,
                  is_endpoint: newValue,
                },
              },
            }
          : prev
      );
    } catch (err) {
      // Optionally show an error to the user
      // e.g. toast.error('Failed to update endpoint status');
    }
  };

  const handleCreateNewLink = () => {
    if (editLinksData?.sourceNode) {
      setShowEditLinksModal(false);
      setConnectData({ sourceNode: editLinksData.sourceNode });
      setShowConnectModal(true);
    }
  };

  if (!showEditLinksModal || !editLinksData) {
    return null;
  }

  return (
    <>
      <Modal
        title="Edit links"
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/connect-node.svg`}
        onClose={handleClose}
        width="w-[600px]"
        showHeaderSeparator={true}
        actions={
          <div className="flex justify-end gap-2 w-full">
            <ButtonNormal variant="primary" size="small" onClick={handleClose}>
              Close
            </ButtonNormal>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Original block section */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold"
                style={{ color: colors['text-secondary'] }}
              >
                Original block
              </label>
              <div
                className="flex items-center gap-2 p-2"
                style={{
                  color: colors['text-primary'],
                  backgroundColor: colors['bg-primary'],
                  borderRadius: '4px',
                }}
              >
                <div className="w-5 h-5">
                  {sourceBlock?.data?.block?.signedIconUrl ? (
                    <img
                      src={sourceBlock.data.block.signedIconUrl}
                      alt="Block Icon"
                      className="w-5 h-5"
                    />
                  ) : sourceBlock?.data?.block?.icon && sourceBlock.data.block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                    <img
                      src={sourceBlock.data.block.icon}
                      alt="Block Icon"
                      className="w-5 h-5"
                    />
                  ) : (
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-commit.svg`}
                      alt="Block"
                      className="w-5 h-5"
                    />
                  )}
                </div>
                <span className="text-sm">
                  {sourceBlock?.data?.block?.title || 'Untitled Block'}
                </span>
              </div>
            </div>
          </div>

          {/* Direction toggle section */}
          {links.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-semibold"
                  style={{ color: colors['text-secondary'] }}
                >
                  Direction
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ minHeight: 20 }}
                  >
                    <div
                      className="relative flex items-center cursor-pointer"
                      style={{ width: 36, height: 20 }}
                      onClick={handleToggleDirection}
                      tabIndex={0}
                      role="switch"
                      aria-checked={isDirectionToggled}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleToggleDirection();
                      }}
                    >
                      <div
                        className="transition-colors duration-200"
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 9999,
                          backgroundColor: isDirectionToggled
                            ? colors['accent-primary'] || '#4761C4'
                            : colors['bg-quaternary'] || '#E4E7EC',
                          boxShadow:
                            '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.1)',
                        }}
                      />
                      <div
                        className="absolute transition-transform duration-200"
                        style={{
                          left: 2,
                          top: 2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          transform: isDirectionToggled
                            ? 'translateX(16px)'
                            : 'translateX(0px)',
                          boxShadow:
                            '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.1)',
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: '#667085',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  >
                    {isDirectionToggled
                      ? 'The user will only be able to follow one of the links below.'
                      : 'The user will be able to follow a link or complete the process.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Links section */}
          <div className="flex flex-col gap-3">
            <label
              className="text-sm font-semibold"
              style={{ color: colors['text-secondary'] }}
            >
              Links
            </label>
            <div className="flex flex-col gap-3">
              {links.length > 0 ? (
                links.map((link, idx) => {
                  const targetNode = getNode(
                    link.target
                  ) as FlowNodeType<NodeData> | null;
                  const isHovered = hoveredLinkId === link.id;
                  const isMenuOpen = openMenuId === link.id;
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center justify-between rounded-md transition-colors duration-150 cursor-pointer`}
                      style={{
                        padding: '8px 8px',
                        backgroundColor:
                          isHovered || isMenuOpen
                            ? colors['bg-primary_hover']
                            : colors['bg-primary'],
                      }}
                      tabIndex={0}
                      onMouseEnter={() => setHoveredLinkId(link.id)}
                      onMouseLeave={() => setHoveredLinkId(null)}
                      onFocus={() => setHoveredLinkId(link.id)}
                      onBlur={() => setHoveredLinkId(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors['text-secondary'] }}
                        >
                          {typeof link.data?.label === 'string'
                            ? link.data.label
                            : 'Unlabeled link'}
                        </span>
                        <div className="w-5 h-5">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-narrow-right.svg`}
                            alt="Arrow"
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {
                          targetNode?.data?.block?.signedIconUrl ? (
                            <img
                              src={targetNode.data.block.signedIconUrl}
                              alt="Block Icon"
                              className="w-4 h-4"
                            />
                          ) : targetNode?.data?.block?.icon && targetNode.data.block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                            <img
                              src={targetNode.data.block.icon}
                              alt="Block Icon"
                              className="w-4 h-4"
                            />
                          ) : (
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/container.svg`}
                              alt="Block"
                              className="w-4 h-4"
                            />
                          )}
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors['text-secondary'] }}
                          >
                            {targetNode?.data?.block?.title || 'Untitled Block'}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          ref={(el) => {
                            dotsRefs.current[link.id] = el;
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-md"
                          style={{
                            backgroundColor:
                              hoveredDotsId === link.id
                                ? colors['bg-secondary_subtle']
                                : 'transparent',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                          }}
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          aria-controls={`link-menu-${link.id}`}
                          tabIndex={0}
                          onMouseEnter={() => setHoveredDotsId(link.id)}
                          onMouseLeave={() => setHoveredDotsId(null)}
                          onFocus={() => setHoveredDotsId(link.id)}
                          onBlur={() => setHoveredDotsId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMenuOpen) setOpenMenuId(null);
                            else handleMenuOpen(link.id, idx);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (isMenuOpen) setOpenMenuId(null);
                              else handleMenuOpen(link.id, idx);
                            }
                          }}
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                            alt="Menu"
                            className="w-5 h-5"
                          />
                        </button>
                        {/* Dropdown menu */}
                        {isMenuOpen && (
                          <div
                            ref={(el) => {
                              menuRefs.current[link.id] = el;
                            }}
                            id={`link-menu-${link.id}`}
                            role="menu"
                            tabIndex={-1}
                            style={{
                              outline: 'none',
                              borderColor: colors['border-secondary'],
                              backgroundColor: colors['bg-secondary'],
                              minWidth: 200,
                              maxWidth: 260,
                              wordBreak: 'break-word',
                            }}
                            className={`absolute right-0 z-50 flex flex-col py-1 overflow-hidden cursor-pointer rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] border transition-all duration-150 origin-top-right bg-white dark:bg-gray-900 ${menuPosition[link.id] === 'top' || links.length === 1 ? 'bottom-7' : 'top-7'} ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                          >
                            <div
                              onClick={() => handleEditLink(link)}
                              className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                              role="menuitem"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                handleMenuKeyDown(e, link.id, 0)
                              }
                            >
                              <div
                                style={
                                  {
                                    '--hover-bg': colors['bg-quaternary'],
                                  } as React.CSSProperties
                                }
                                className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] focus:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
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
                                    className="grow shrink basis-0 text-xs font-medium font-['Inter'] leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                                  >
                                    Edit link
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                borderColor: colors['border-secondary'],
                              }}
                              className="self-stretch h-px border-b my-1"
                            />
                            <div
                              onClick={() => handleDeleteLink(link)}
                              className="self-stretch px-1.5 py-px flex items-center gap-3"
                              role="menuitem"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                handleMenuKeyDown(e, link.id, 1)
                              }
                            >
                              <div
                                style={
                                  {
                                    '--hover-bg': colors['bg-quaternary'],
                                  } as React.CSSProperties
                                }
                                className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] focus:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
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
                                    className="grow shrink basis-0 text-xs font-medium font-['Inter'] leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                                  >
                                    Delete link
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className="p-4 text-center"
                  style={{ color: colors['text-tertiary'] }}
                >
                  No links found
                </div>
              )}
            </div>
            <ButtonNormal
              variant="secondary"
              size="small"
              className="mt-2 w-full"
              onClick={handleCreateNewLink}
            >
              Create a new link
            </ButtonNormal>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditLinksModal;
