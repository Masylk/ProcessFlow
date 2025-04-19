import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { NodeData } from '../../../types';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { usePathsStore } from '../../store/pathsStore';
import { useColors } from '@/app/theme/hooks';
import DeletePathModal from '../modals/DeletePathModal';
import { BasicBlock } from './BasicBlock';
import { toast } from 'sonner';

// Simple tooltip component
type TooltipProps = {
  content: string;
  children: React.ReactNode;
  show: boolean;
};

const Tooltip = ({ content, children, show }: TooltipProps) => {
  const colors = useColors();
  const zoom = useStore((state) => state.transform?.[2] ?? 1);

  if (!show) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className="absolute left-0 right-0 w-full text-center bottom-full z-50"
        style={{
          transform: `scale(${1 / zoom})`,
          transformOrigin: 'center bottom',
          marginBottom: '8px',
        }}
      >
        <div
          className="inline-block py-1 px-1.5 rounded-lg text-xs whitespace-normal max-w-full mx-auto flex flex-col items-center bg-opacity-100"
          style={{
            backgroundColor: colors['utility-brand-500'],
            color: colors['text-white'],
            boxShadow:
              '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
            maxWidth: '200px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          <div className="px-1">{content}</div>
          <div
            className="w-0 h-0 absolute -bottom-1"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${colors['utility-brand-500']}`,
            }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

function BeginBlock(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [pathName, setPathName] = useState(data.path?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isEditButtonHovered, setIsEditButtonHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colors = useColors();

  // Check if title is truncated
  const checkTitleTruncation = () => {
    if (titleRef.current) {
      const isTruncated =
        titleRef.current.scrollWidth > titleRef.current.clientWidth;
      setIsTitleTruncated(isTruncated);
    }
  };

  // Run check when path name changes or on resize
  useEffect(() => {
    checkTitleTruncation();

    // Also check on window resize
    const handleResize = () => {
      checkTitleTruncation();
    };

    window.addEventListener('resize', handleResize);

    // Force a check after a small delay to ensure rendering is complete
    const timeoutId = setTimeout(() => {
      checkTitleTruncation();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [data.path?.name]);

  const handlePathNameUpdate = async () => {
    try {
      const response = await fetch(`/api/paths/${data.path?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pathName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update path name');
      }

      const updatedPath = await response.json();

      // Update the path in allPaths while preserving existing data
      const updatedPaths = allPaths.map((path) =>
        path.id === updatedPath.id
          ? { ...path, ...updatedPath } // Merge the update with existing data
          : path
      );

      // Update global state
      setAllPaths(updatedPaths);

      // Notify parent of update
      data.onPathsUpdate?.(updatedPaths);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating path name:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePathNameUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setPathName(data.path?.name || '');
    }
  };

  const canDelete =
    data.path?.parent_blocks && data.path?.parent_blocks.length !== 0;

  const canEdit =
    data.path?.parent_blocks && data.path?.parent_blocks.length !== 0;

  const isFirstPath =
    data.path?.parent_blocks && data.path?.parent_blocks.length === 0;

  const hasMultipleParentBlocks =
    data.path?.parent_blocks && data.path?.parent_blocks.length > 1;

  return (
    <BasicBlock {...props}>
      {hasMultipleParentBlocks ? (
        <div className="transition-opacity duration-300">
          <Handle
            type="target"
            id="top"
            position={Position.Top}
            style={{
              background: '#b1b1b7',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />
          <div className="w-1 h-1 rounded-full bg-[#b1b1b7]" />
          <Handle
            type="source"
            id="bottom"
            position={Position.Bottom}
            style={{
              background: '#b1b1b7',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />
        </div>
      ) : isFirstPath ? (
        <div
          className="flex items-center justify-center rounded-full shadow-sm relative"
          style={{
            background: colors['utility-brand-100'],
            border: `1.5px solid ${selected ? colors['utility-brand-500'] : colors['utility-brand-200']}`,
            width: '350px',
            height: '50px',
            transition: 'border 0.2s',
            padding: 0,
          }}
        >
          {/* Top Handle (hidden but present for flow) */}
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 8,
              height: 8,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
              position: 'absolute',
              left: '50%',
              top: '-8px',
              transform: 'translateX(-50%)',
            }}
          />
          {/* Sparkle Icon */}
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stars-02.svg`}
              alt="Start"
              className="w-5 h-5 block"
              draggable={false}
            />
          </span>
          {/* Path Name or Default Text */}
          <div
            ref={titleRef}
            className="font-medium text-base text-center truncate"
            style={{
              color: colors['text-brand-primary'],
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={() => {
              checkTitleTruncation();
              tooltipTimeoutRef.current = setTimeout(() => {
                if (
                  titleRef.current &&
                  titleRef.current.scrollWidth > titleRef.current.clientWidth
                ) {
                  setShowTooltip(true);
                }
              }, 500);
            }}
            onMouseLeave={() => {
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
              }
              setShowTooltip(false);
            }}
          >
            {'This is where your process starts'}
          </div>
          {/* Bottom Handle (hidden but present for flow) */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{
              width: 8,
              height: 8,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
              position: 'absolute',
              left: '50%',
              bottom: '-8px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      ) : (
        <div
          className={`relative transition-all duration-300 flex items-center justify-center ${
            isConnectMode ? 'opacity-40' : ''
          } ${isEditMode ? 'ring-2 ring-utility-brand-500' : ''}`}
          style={{
            width: '200px',
            height: '50px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: selected
              ? `2px solid ${colors['utility-brand-500']}`
              : `2px solid ${colors['utility-brand-400']}`,
            background: colors['utility-brand-100'],
            position: 'relative',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowTooltip(false);
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
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />

          <div className="w-full">
            {isEditing && canEdit ? (
              <input
                type="text"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handlePathNameUpdate}
                autoFocus
                className="bg-transparent outline-none w-full text-center font-medium"
                style={{ color: colors['text-brand-primary'] }}
                placeholder="Enter path name"
              />
            ) : (
              <Tooltip content={data.path?.name || 'Path'} show={showTooltip}>
                <div
                  ref={titleRef}
                  className="font-medium truncate text-center w-full cursor-default"
                  style={{ color: colors['text-brand-primary'] }}
                  onMouseEnter={() => {
                    // Force check truncation on hover
                    checkTitleTruncation();

                    // Always set the timeout, we'll check truncation when showing
                    tooltipTimeoutRef.current = setTimeout(() => {
                      // Only actually show if truncated
                      if (
                        titleRef.current &&
                        titleRef.current.scrollWidth >
                          titleRef.current.clientWidth
                      ) {
                        setShowTooltip(true);
                      }
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                      tooltipTimeoutRef.current = null;
                    }
                    setShowTooltip(false);
                  }}
                >
                  {data.path?.name || 'Path'}
                </div>
              </Tooltip>
            )}
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{
              width: 8,
              height: 8,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />

          {/* Edit and Delete buttons that appear on hover */}
          {isHovered && !isEditing && (
            <div
              className="absolute -right-2 -top-[50%] flex rounded-lg"
              style={{
                background: colors['bg-secondary'],
                border: `1px solid ${colors['border-primary']}`,
                boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
              }}
            >
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  onMouseEnter={() => setIsEditButtonHovered(true)}
                  onMouseLeave={() => setIsEditButtonHovered(false)}
                  className="flex items-center justify-center p-2 transition-colors duration-200"
                  style={{
                    borderRight: `1px solid ${colors['border-primary']}`,
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    background: isEditButtonHovered
                      ? colors['bg-tertiary']
                      : colors['bg-secondary'],
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                    alt="Edit"
                    className="w-3 h-3"
                  />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  onMouseEnter={() => setIsDeleteButtonHovered(true)}
                  onMouseLeave={() => setIsDeleteButtonHovered(false)}
                  className="flex items-center justify-center p-2 transition-colors duration-200"
                  style={{
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    background: isDeleteButtonHovered
                      ? colors['bg-tertiary']
                      : colors['bg-secondary'],
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                    alt="Delete"
                    className="w-3 h-3"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <DeletePathModal
          onClose={() => {
            setShowDeleteModal(false);
          }}
          onConfirm={(success: boolean, errorMessage?: string) => {
            setShowDeleteModal(false);
            if (success) {
              toast.success('Path deleted');
            } else {
              toast.error(errorMessage || 'Failed to delete path');
            }
          }}
          pathName={data.path?.name || 'this path'}
          pathId={
            data.path?.id !== undefined ? String(data.path.id) : undefined
          }
          workflowId={
            data.path?.workflow_id !== undefined
              ? String(data.path.workflow_id)
              : undefined
          }
          setAllPaths={setAllPaths}
          onPathsUpdate={data.onPathsUpdate}
        />
      )}
    </BasicBlock>
  );
}

export default BeginBlock;
