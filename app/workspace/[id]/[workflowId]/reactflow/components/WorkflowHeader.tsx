'use client';

import ButtonCTA from '@/app/components/ButtonCTA';
import React, { useEffect, useState } from 'react';
import TitleBar from '../../components/TitleBar';
import { useRouter, usePathname } from 'next/navigation';
import AvatarGroup from '@/app/components/AvatarGroup';

interface WorkflowHeaderProps {
  workflowId: string;
  parentFolder?: string;
  grandParentFolder?: string;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowId,
  parentFolder,
  grandParentFolder,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');

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

  const navigateToEdit = () => {
    const segments = pathname.split('/');
    segments[segments.length - 1] = 'read';
    const editPath = segments.join('/');
    router.push(editPath);
  };

  return (
    <div className="overflow-hidden w-full h-[68px] p-4 bg-white border-b border-[#e4e7ec] flex justify-between items-center z-40">
      <ButtonCTA
        start_icon="/assets/shared_components/arrow-left.svg"
        onClick={navigateToFirstSegment}
        bgColor="transparent"
        hoverBgColor="transparent"
        textColor="#475467"
      >
        Back to Dashboard
      </ButtonCTA>

      <div className="pl-24 flex items-center gap-2">
        {grandParentFolder && (
          <>
            <span className="text-gray-600">{grandParentFolder}</span>
            <span className="text-gray-400">/</span>
          </>
        )}
        {parentFolder && (
          <>
            <span className="text-gray-600">{parentFolder}</span>
            <span className="text-gray-400">/</span>
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
            className="px-2 py-1 border-b-2 border-blue-500 outline-none bg-transparent"
          />
        ) : (
          <span
            className="text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
            onClick={() => setIsEditing(true)}
          >
            {workflowTitle || 'Untitled Workflow'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <AvatarGroup urls={avatarUrls} />

        <div className="pl-4 border-l border-[#d0d5dd] justify-start items-center gap-2 flex">
          <ButtonCTA
            start_icon="/assets/shared_components/play-icon.svg"
            onClick={navigateToEdit}
            bgColor="transparent"
            hoverBgColor="transparent"
            textColor="#475467"
          ></ButtonCTA>

          <ButtonCTA
            start_icon="/assets/workflow/share.svg"
            onClick={() => alert('Share button clicked!')}
          >
            Share
          </ButtonCTA>
        </div>
      </div>
    </div>
  );
};

export default WorkflowHeader;
