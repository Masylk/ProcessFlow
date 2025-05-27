'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarGroup from '@/app/components/AvatarGroup';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';
import ShareModal from '@/app/components/ShareModal';
import EditFlowModal from '@/app/dashboard/components/EditFlowModal';
import { createReadLink } from '../../utils/createLinks';
import { Workflow } from '@/types/workflow';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowHeaderProps {
  workflowId: string;
  parentFolder?: string;
  grandParentFolder?: string;
  slug?: string;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = React.memo(
  ({ workflowId, parentFolder, grandParentFolder, slug }) => {
    const router = useRouter();
    const pathname = usePathname();
    const colors = useColors();
    const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
    const [workflowTitle, setWorkflowTitle] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditFlowModalOpen, setIsEditFlowModalOpen] = useState(false);
    const [editableTitle, setEditableTitle] = useState('');
    const [createdDate, setCreatedDate] = useState('');
    const [workflowData, setWorkflowData] = useState<Workflow | null>(null);

    useEffect(() => {
      const files = [
        'images/placeholder-avatar1.png',
        'images/placeholder-avatar2.png',
        'images/placeholder-avatar3.png',
      ];
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}`;
      const urls = files.map((file) => `${baseUrl}/${file}`);
      setAvatarUrls(urls);
    }, []);

    useEffect(() => {
      const fetchWorkflowData = async () => {
        try {
          const response = await fetch(`/api/workflow/${workflowId}`);
          if (response.ok) {
            const data = await response.json();
            setWorkflowTitle(data.title || data.name);
            setEditableTitle(data.title || data.name);
            setWorkflowData(data);

            // Format the created date
            if (data.created_at) {
              const date = new Date(data.created_at);
              const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              setCreatedDate(formattedDate);
            }
          }
        } catch (error) {
          console.error('Error fetching workflow data:', error);
        }
      };

      fetchWorkflowData();
    }, [workflowId]);

    const navigateToFirstSegment = () => {
      router.push('/');
    };

    const navigateToRead = () => {
      if (slug) {
        const readPath = createReadLink(workflowTitle, workflowId, slug);
        router.push(readPath);
      }
    };

    const openShareModal = () => {
      setIsShareModalOpen(true);
      setIsDropdownOpen(false);
    };

    const closeShareModal = () => {
      setIsShareModalOpen(false);
    };

    const handleDropdownToggle = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

    const handleEditProcessInfo = () => {
      setIsEditFlowModalOpen(true);
      setIsDropdownOpen(false);
    };

    const handleDeleteProcess = () => {
      // TODO: Implement delete process functionality
      console.log('Delete process clicked');
      setIsDropdownOpen(false);
    };

    const dropdownMenuItems = [
      {
        label: 'Edit Flow info',
        icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`,
        onClick: handleEditProcessInfo,
      },
      {
        label: 'Delete Flow',
        icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`,
        onClick: handleDeleteProcess,
      },
    ];

    return (
      <>
        <div
          className="fixed top-0 left-0 w-full h-[56px] p-4 flex justify-between items-center z-30"
          style={{
            backgroundColor: colors['bg-primary'],
            borderBottom: `1px solid ${colors['border-primary']}`,
          }}
        >
          <ButtonNormal
            variant="tertiary"
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
            onClick={navigateToFirstSegment}
          >
            Back to Dashboard
          </ButtonNormal>

          <div className="pl-24 flex items-center gap-3">
            {grandParentFolder && (
              <>
                <span
                  className="text-sm font-['Inter'] px-2 py-1 rounded-md"
                  style={{
                    color: colors['breadcrumb-inactive-fg'],
                    fontWeight: 500,
                  }}
                >
                  {grandParentFolder}
                </span>
                <div
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ color: colors['breadcrumb-separator'] }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slash-divider.svg`}
                    alt="/"
                    width="16"
                    height="16"
                  />
                </div>
              </>
            )}
            {parentFolder && (
              <>
                <span
                  className="text-sm font-['Inter'] px-2 py-1 rounded-md"
                  style={{
                    color: colors['breadcrumb-inactive-fg'],
                    fontWeight: 500,
                  }}
                >
                  {parentFolder}
                </span>
                <div
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ color: colors['breadcrumb-separator'] }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slash-divider.svg`}
                    alt="/"
                    width="16"
                    height="16"
                  />
                </div>
              </>
            )}

            {/* Workflow title with dropdown */}
            <div className="relative">
              <span
                className="text-sm font-['Inter'] px-2 py-1 rounded-md cursor-pointer flex items-center gap-1"
                style={{
                  color: colors['breadcrumb-active-fg'],
                  backgroundColor: colors['breadcrumb-active-bg'],
                  fontWeight: 600,
                }}
                onClick={handleDropdownToggle}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.75';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {workflowTitle || 'Untitled Workflow'}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: isDropdownOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{
                      duration: 0.15,
                      ease: [0.16, 1, 0.3, 1], // Custom easing for smooth feel
                    }}
                    className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] border z-50 overflow-hidden py-1 flex flex-col"
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-primary'],
                    }}
                  >
                    {dropdownMenuItems.map((item, index) => (
                      <div key={index}>
                        <div
                          onClick={item.onClick}
                          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
                        >
                          <div
                            style={
                              {
                                '--hover-bg': colors['bg-quaternary'],
                              } as React.CSSProperties
                            }
                            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden cursor-pointer"
                          >
                            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                              <div className="w-4 h-4 relative overflow-hidden">
                                <img
                                  src={item.icon}
                                  alt={item.label}
                                  className="w-4 h-4"
                                />
                              </div>
                              <div
                                style={{
                                  color: colors['text-primary'],
                                }}
                                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                              >
                                {item.label}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Add separator after "Edit Flow info" (index 0) */}
                        {index === 0 && (
                          <div
                            style={{ borderColor: colors['border-secondary'] }}
                            className="self-stretch h-px border-b my-1"
                          />
                        )}
                      </div>
                    ))}

                    {/* Separator before "Created on" information */}
                    {createdDate && (
                      <div
                        style={{ borderColor: colors['border-secondary'] }}
                        className="self-stretch h-px border-b my-1"
                      />
                    )}

                    {/* Created on information */}
                    {createdDate && (
                      <div className="self-stretch px-1.5 py-px">
                        <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-2 flex">
                          <div
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-normal font-['Inter'] leading-tight"
                          >
                            Created on: {createdDate}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4 ">
            {/*<AvatarGroup urls={avatarUrls} />*/}

            <div
              className="pl-4 justify-start items-center gap-2 flex"
              style={{ borderLeft: `1px solid ${colors['border-primary']}` }}
            >
              {slug && (
                <ButtonNormal
                  variant="tertiary"
                  iconOnly={true}
                  leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/play-icon.svg`}
                  onClick={navigateToRead}
                />
              )}
            </div>
          </div>
        </div>

        {/* Edit Process Info Modal */}
        {isEditFlowModalOpen && workflowData && (
          <EditFlowModal
            selectedWorkflow={workflowData}
            onClose={() => setIsEditFlowModalOpen(false)}
            onConfirm={async (
              id: number,
              name: string,
              description: string,
              process_owner: string,
              review_date: string,
              additional_notes: string,
              folder: any,
              icon: string | null,
              signedIcon: string | null
            ) => {
              try {
                // Convert review_date to ISO-8601 if present and not empty
                let reviewDateISO: string | null = null;
                if (review_date && review_date.trim() !== '') {
                  // If review_date is already ISO, this is safe; if it's "YYYY-MM-DD", this will work too
                  reviewDateISO = new Date(review_date).toISOString();
                }

                const response = await fetch(`/api/workflow/${workflowId}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name,
                    description,
                    process_owner,
                    review_date: reviewDateISO,
                    additional_notes,
                    icon,
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to update workflow');
                }

                const updatedWorkflow = await response.json();

                // Update local state
                setWorkflowTitle(name);
                setEditableTitle(name);
                setWorkflowData(updatedWorkflow);

                return { workflow: updatedWorkflow };
              } catch (error) {
                console.error('Error updating workflow:', error);
                return {
                  workflow: null,
                  error: {
                    title: 'Update Failed',
                    description:
                      'Failed to update the workflow. Please try again.',
                  },
                };
              }
            }}
          />
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          itemName={workflowTitle || 'Untitled Workflow'}
        />
      </>
    );
  }
);

export default WorkflowHeader;
