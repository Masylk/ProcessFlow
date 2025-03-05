'use client';

import ButtonCTA from '@/app/components/ButtonCTA';
import React, { useEffect, useState } from 'react';
import TitleBar from './TitleBar';
import { useRouter, usePathname } from 'next/navigation';
// import FakeButtonCTA from '@/app/components/FakeButtonCTA';
import AvatarGroup from '@/app/components/AvatarGroup';

interface WorkflowHeaderProps {
  workflowTitle: string;
  updateWorkflowTitle: (newTitle: string) => Promise<void>;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowTitle,
  updateWorkflowTitle,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);

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

  const navigateToFirstSegment = () => {
    const segments = pathname.split('/');
    const workspaceIndex = segments.indexOf('workspace');
    if (workspaceIndex !== -1 && workspaceIndex + 1 < segments.length) {
      const targetSegment = segments.slice(0, workspaceIndex + 2).join('/');
      router.push(targetSegment);
    } else {
      router.push('/');
    }
  };

  // Function to navigate to the read page
  const navigateToRead = () => {
    const segments = pathname.split('/');
    if (segments[segments.length - 1] === 'edit') {
      // Replace 'edit' with 'read'
      segments[segments.length - 1] = 'read';
      const editPath = segments.join('/');
      router.push(editPath);
    }
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

      <div className="pl-24 flex items-center">
        <TitleBar title={workflowTitle} onUpdateTitle={updateWorkflowTitle} />
      </div>

      <div className="flex items-center gap-4">
        <AvatarGroup urls={avatarUrls} />

        <div className="pl-4 border-l border-[#d0d5dd] justify-start items-center gap-2 flex">
          {/* <FakeButtonCTA
            start_icon="/assets/shared_components/cloud.svg"
            bgColor="transparent"
            textColor="#475467"
          >
            Saved
          </FakeButtonCTA> */}

          <ButtonCTA
            start_icon="/assets/shared_components/play-icon.svg"
            onClick={navigateToRead}
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
