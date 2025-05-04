'use client';

import { Workflow, WorkflowStatus } from '@/types/workflow';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { Workspace } from '@/types/workspace';
import DynamicIcon from '../../../utils/DynamicIcon';
import { useColors } from '@/app/theme/hooks';
import {
  createEditLink,
  createReadLink,
  createShareLink,
} from '@/app/[slug]/[flow]/utils/createLinks';
import { toast } from 'sonner';
import ShareModal from '@/app/components/ShareModal';

interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  label: string;
}

type MenuItem = { label: string; icon: string } | 'separator';

const menuItems: MenuItem[] = [
  { label: 'Open in read mode', icon: 'play.svg' },
  { label: 'Share', icon: 'share-01.svg' },
  'separator',
  { label: 'Edit Flow info', icon: 'edit-05.svg' },
  { label: 'Duplicate', icon: 'duplicate-icon.svg' },
  { label: 'Move', icon: 'folder-download.svg' },
  'separator',
  { label: 'Delete Flow', icon: 'trash-01.svg' },
];

interface WorkflowCardProps {
  workflow: Workflow;
  workspace: Workspace;
  onSelectWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflow: Workflow) => void;
  onEditWorkflow: (workflow: Workflow) => void;
  onDuplicateWorkflow: (workflow: Workflow) => void;
  onMoveWorkflow: (workflow: Workflow) => void;
  onStatusChange: (workflow: Workflow, newStatus: WorkflowStatus) => void;
}

export default function WorkflowCard({
  workflow,
  workspace,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  onStatusChange,
}: WorkflowCardProps) {
  const colors = useColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isStarFilled, setIsStarFilled] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const statusButtonRef = useRef<HTMLDivElement | null>(null);
  const actionsButtonRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState<
    'top' | 'bottom'
  >('bottom');
  const [actionsMenuPosition, setActionsMenuPosition] = useState<
    'top' | 'bottom'
  >('bottom');
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [localIsPublic, setLocalIsPublic] = useState(workflow.is_public);

  const formatLastEdited = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const STATUS_STYLES: Record<WorkflowStatus, StatusStyle> = {
    ACTIVE: {
      bg: colors['utility-success-100'],
      border: colors['utility-success-200'],
      text: colors['utility-success-700'],
      label: 'Active',
    },
    DRAFT: {
      bg: colors['utility-gray-50'],
      border: colors['utility-gray-200'],
      text: colors['utility-gray-700'],
      label: 'Draft',
    },
    IN_REVIEW: {
      bg: colors['utility-purple-100'],
      border: colors['utility-purple-200'],
      text: colors['utility-purple-700'],
      label: 'In review',
    },
    NEEDS_UPDATE: {
      bg: colors['utility-warning-100'],
      border: colors['utility-warning-200'],
      text: colors['utility-warning-700'],
      label: 'Needs update',
    },
    ARCHIVED: {
      bg: colors['utility-error-50'],
      border: colors['utility-error-200'],
      text: colors['utility-error-700'],
      label: 'Archived',
    },
  };

  const handleWorkflowClick = (workflowId: number) => {
    const editLink = createEditLink(
      workflow.name,
      workflow.id.toString(),
      workspace.name
    );
    router.push(editLink);
  };

  const navigateToEditMode = (workflowId: number) => {
    const readLink = createReadLink(
      workflow.name,
      workflow.id.toString(),
      workspace.name
    );
    router.push(readLink);
  };

  const handleCopyLink = async () => {
    if (!workflow) return;
    
    try {
      const url = createShareLink(workflow.name, workflow.public_access_id);
      if (!url) throw new Error('Could not create share link');
      
      try {
        // Try the modern clipboard API first
        await navigator.clipboard.writeText(url);
        toast.success('Link Copied!', {
          description: 'Share link has been copied to your clipboard.',
          duration: 3000,
        });
      } catch (err) {
        try {
          // Fallback: Create a temporary textarea element
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          // Try the execCommand approach as fallback
          const successful = document.execCommand('copy');
          textArea.remove();

          if (successful) {
            toast.success('Link Copied!', {
              description: 'Share link has been copied to your clipboard.',
              duration: 3000,
            });
          } else {
            throw new Error('Fallback copy failed');
          }
        } catch (fallbackErr) {
          // If both methods fail, show error with the URL
          toast.error('Failed to Copy', {
            description: 'Please copy this URL manually: ' + url,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to Copy', {
        description: 'Could not create the share link.',
        duration: 3000,
      });
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isStatusMenuOpen) {
      setIsStatusMenuOpen(false);
    }
    if (actionsButtonRef.current) {
      const buttonRect = actionsButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const menuHeight = 240; // Increased to account for all menu items + padding
      setActionsMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    if (statusButtonRef.current) {
      const buttonRect = statusButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const menuHeight = 180; // Approximate height of status menu
      setStatusMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
    }
    setIsStatusMenuOpen(!isStatusMenuOpen);
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsStatusMenuOpen(false);
      }
    }

    if (isMenuOpen || isStatusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false);
          setIsStatusMenuOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMenuOpen, isStatusMenuOpen]);

  const currentStatus = STATUS_STYLES[workflow.status as WorkflowStatus];

  const handleToggleAccess = async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      
      // Optimistic update for immediate feedback
      setLocalIsPublic(!localIsPublic);
      
      const response = await fetch(`/api/workflow/${workflow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_public: !localIsPublic,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Revert the optimistic update if the server request failed
        setLocalIsPublic(workflow.is_public);
        throw new Error(responseData.message || 'Failed to update workflow access');
      }

      // Update with the actual server response data
      const updatedWorkflow = {
        ...workflow,
        is_public: responseData.is_public,
      };
      onSelectWorkflow(updatedWorkflow);

      // Use the actual server response to determine the new state
      const newState = responseData.is_public;
      toast.success('Access updated', {
        description: `Workflow is now ${newState ? 'public' : 'private'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling workflow access:', error);
      toast.error('Failed to update access', {
        description: 'Could not update the workflow access settings.',
        duration: 3000,
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Update localIsPublic when workflow.is_public changes
  useEffect(() => {
    setLocalIsPublic(workflow.is_public);
  }, [workflow.is_public]);

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => handleWorkflowClick(workflow.id)}
        style={
          {
            backgroundColor: colors['bg-primary'],
            borderColor:
              isHovered || isMenuOpen
                ? colors['border-primary']
                : colors['border-secondary'],
            '--hover-bg': colors['bg-quaternary'],
          } as React.CSSProperties
        }
        className="rounded-lg border hover:cursor-pointer relative transition-all ease-in-out hover:bg-[var(--hover-bg)] h-[180px] flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Menu Icons */}
        <div className="absolute top-3 right-3 z-2">
          <div className="flex items-center gap-2">
            {/* Star Button */}
            <div
              style={
                {
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="w-6 h-6 rounded hidden items-center justify-center cursor-pointer hover:bg-[var(--hover-bg)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsStarFilled(!isStarFilled);
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${isStarFilled ? 'star-filled.svg' : 'star-01.svg'}`}
                alt="Star Icon"
                className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity select-none"
                draggable="false"
              />
            </div>

            {/* Menu Button */}
            <div
              ref={actionsButtonRef}
              data-menu-button
              style={
                {
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="w-7 h-7 rounded flex items-center justify-center cursor-pointer hover:bg-[var(--hover-bg)] transition-colors"
              onClick={handleMenuClick}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-quinary.svg`}
                alt="Menu"
                className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity select-none"
                draggable="false"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="p-4 flex-1">
            {/* Icon */}
            <div className="mb-3">
              <div className="flex items-center justify-center w-8 h-8">
                {workflow.icon ? (
                  workflow.icon.startsWith('https://cdn.brandfetch.io/') ? (
                    <img
                      src={workflow.icon}
                      alt={workflow.name}
                      className="w-6 h-auto object-contain"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <DynamicIcon
                      url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${workflow.icon}`}
                      size={32}
                      color="inherit"
                      className="select-none"
                    />
                  )
                ) : (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                    alt="Default Icon"
                    className="w-8 h-8 select-none"
                    draggable="false"
                  />
                )}
              </div>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h3
                style={{ color: colors['text-primary'] }}
                className="font-medium text-md line-clamp-2 break-words overflow-hidden"
                title={workflow.name}
              >
                {workflow.name}
              </h3>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto">
            <div
              style={{ borderColor: colors['border-secondary'] }}
              className="border-t w-full"
            />
            <div className="px-4 py-3 flex items-center justify-between">
              <div
                className="relative"
                ref={statusButtonRef}
                onClick={handleStatusClick}
              >
                <div
                  style={{
                    backgroundColor: currentStatus.bg,
                    borderColor: currentStatus.border,
                    color: currentStatus.text,
                  }}
                  className="px-2 py-0.5 text-xs rounded-full border cursor-pointer transition-colors duration-150"
                >
                  {currentStatus.label}
                </div>

                {/* Status Dropdown Menu */}
                {isStatusMenuOpen && (
                  <div
                    ref={statusMenuRef}
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-primary'],
                      ...(statusMenuPosition === 'top'
                        ? { bottom: 'calc(100% + 4px)' }
                        : { top: 'calc(100% + 4px)' }),
                    }}
                    className="absolute left-0 z-30 rounded-lg border shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex flex-col">
                      {Object.entries(STATUS_STYLES).map(([key, style]) => (
                        <div
                          key={key}
                          className="self-stretch px-1.5 py-px flex items-center gap-3"
                          onClick={(e) => {
                            e.preventDefault();
                            onStatusChange(workflow, key as WorkflowStatus);
                            setIsStatusMenuOpen(false);
                          }}
                        >
                          <div
                            style={
                              {
                                '--hover-bg': colors['bg-quaternary'],
                              } as React.CSSProperties
                            }
                            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                          >
                            <div
                              style={{ color: colors['text-primary'] }}
                              className="text-sm font-normal font-['Inter'] leading-tight flex items-center gap-2"
                            >
                              <div
                                style={{
                                  backgroundColor: style.bg,
                                  borderColor: style.border,
                                }}
                                className="w-2 h-2 rounded-full border"
                              ></div>
                              {style.label}
                            </div>
                            {key === workflow.status && (
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon2.svg`}
                                alt="Selected"
                                className="w-4 h-4 opacity-70 ml-auto select-none"
                                draggable="false"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span
                style={{ color: colors['text-tertiary'] }}
                className="text-xs truncate ml-4"
              >
                Last update: {formatLastEdited(workflow.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            style={{
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-primary'],
              ...(actionsMenuPosition === 'top'
                ? { bottom: 'calc(100%)' }
                : { top: '40px' }),
              right: '4px',
              
            }}
            className="absolute w-48 py-1 rounded-lg shadow-md z-30 overflow-hidden border"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) =>
              item === 'separator' ? (
                <div
                  key={`sep-${index}`}
                  style={{ borderColor: colors['border-secondary'] }}
                  className="w-full border-b my-1"
                />
              ) : (
                <div
                  key={index}
                  className="self-stretch px-1.5 py-px flex items-center gap-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWorkflow(workflow);
                    if (item.label === 'Delete Flow') {
                      onDeleteWorkflow(workflow);
                    } else if (item.label === 'Move') {
                      onMoveWorkflow(workflow);
                    } else if (item.label === 'Edit Flow info') {
                      onEditWorkflow(workflow);
                    } else if (item.label === 'Open in read mode') {
                      navigateToEditMode(workflow.id);
                    } else if (item.label === 'Duplicate') {
                      onDuplicateWorkflow(workflow);
                    } else if (item.label === 'Share') {
                      setIsShareModalOpen(true);
                    }
                    setIsMenuOpen(false);
                  }}
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
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${item.icon}`}
                          alt={`${item.label} Icon`}
                          className="w-4 h-4 select-none"
                          draggable="false"
                        />
                      </div>
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                      >
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        shareUrl={createShareLink(workflow.name, workflow.public_access_id)}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemName={workflow.name}
        shareableLink={createShareLink(workflow.name, workflow.public_access_id)}
        is_public={localIsPublic}
        onToggleAccess={handleToggleAccess}
      />
    </>
  );
}
