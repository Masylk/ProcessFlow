'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarGroup from '@/app/components/AvatarGroup';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';
import ShareModal from '@/app/components/ShareModal';
import { createReadLink } from '../../utils/createLinks';

interface WorkflowHeaderProps {
  workflowId: string;
  parentFolder?: string;
  grandParentFolder?: string;
  slug?: string;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowId,
  parentFolder,
  grandParentFolder,
  slug,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    const fetchWorkflowTitle = async () => {
      try {
        const response = await fetch(`/api/workflow/${workflowId}/title`);
        if (response.ok) {
          const data = await response.json();
          setWorkflowTitle(data.title);
          setEditableTitle(data.title);
        }
      } catch (error) {
        console.error('Error fetching workflow title:', error);
      }
    };

    fetchWorkflowTitle();
  }, [workflowId]);

  const navigateToFirstSegment = () => {
    router.push('/dashboard');
  };

  const handleTitleUpdate = async () => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editableTitle }),
      });

      if (!response.ok) throw new Error('Failed to update workflow title');

      setWorkflowTitle(editableTitle);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating workflow title:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleUpdate();
    } else if (e.key === 'Escape') {
      setEditableTitle(workflowTitle);
      setIsEditing(false);
    }
  };

  const navigateToRead = () => {
    if (slug) {
      const readPath = createReadLink(workflowTitle, workflowId, slug);
      router.push(readPath);
    }
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full overflow-hidden h-[56px] p-4 flex justify-between items-center z-40"
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
                  fontWeight: 500
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
                  fontWeight: 500
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
          {isEditing ? (
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={handleTitleUpdate}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm px-2 py-1 outline-none"
              style={{
                backgroundColor: 'transparent',
                borderBottom: `2px solid ${colors['border-brand']}`,
                color: colors['text-primary'],
              }}
            />
          ) : (
            <span
              className="text-sm font-['Inter'] px-2 py-1 rounded-md cursor-pointer"
              style={{
                color: colors['breadcrumb-active-fg'],
                backgroundColor: colors['breadcrumb-active-bg'],
                fontWeight: 600
              }}
              onClick={() => setIsEditing(true)}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.75";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {workflowTitle || 'Untitled Workflow'}
            </span>
          )}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        itemName={workflowTitle || 'Untitled Workflow'}
      />
    </>
  );
};

export default WorkflowHeader;
