'use client';

import ButtonCTA from '@/app/components/ButtonCTA';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarGroup from '@/app/components/AvatarGroup';
import BreadCrumbs from './BreadCrumbs'; // Corrected import path

interface HeaderProps {
  workspaceName: string;
  workflowName: string;
}

const Header: React.FC<HeaderProps> = ({ workspaceName, workflowName }) => {
  const router = useRouter();
  const pathname = usePathname();

  // URLs for avatars
  const avatarUrls = [
    '/images/placeholder-avatar1.png',
    '/images/placeholder-avatar2.png',
    '/images/placeholder-avatar3.png',
  ];

  // Function to navigate to the first segment after "workspace"
  const navigateToFirstSegment = () => {
    const segments = pathname.split('/'); // Split the path into segments
    const workspaceIndex = segments.indexOf('workspace'); // Find the "workspace" segment
    if (workspaceIndex !== -1 && workspaceIndex + 1 < segments.length) {
      // Get the first segment after "workspace"
      const targetSegment = segments.slice(0, workspaceIndex + 2).join('/');
      router.push(targetSegment);
    } else {
      router.push('/'); // Default to root if "workspace" or its next segment is not found
    }
  };

  // Function to navigate to the edit page
  const navigateToEdit = () => {
    const segments = pathname.split('/');
    if (segments[segments.length - 1] === 'read') {
      // Replace 'read' with 'edit'
      segments[segments.length - 1] = 'edit';
      const editPath = segments.join('/');
      router.push(editPath);
    }
  };

  return (
    <div className="overflow-hidden w-full h-[68px] p-4 bg-white border-b border-[#e4e7ec] flex justify-between items-center z-40">
      {/* Left Section: ButtonCTA and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <ButtonCTA
          start_icon="/assets/shared_components/arrow-left.svg"
          onClick={navigateToFirstSegment}
          bgColor="transparent"
          hoverBgColor="transparent"
          textColor="#475467"
        ></ButtonCTA>

        {/* Breadcrumb Section */}
        <BreadCrumbs items={[workspaceName, workflowName]} />
      </div>

      {/* Right Section: User Avatars and Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Button Section with Line */}
        <div className="pl-4 border-[#d0d5dd] justify-start items-center gap-2 flex">
          {/* Button edit */}
          <ButtonCTA
            start_icon="/assets/shared_components/edit-icon.svg"
            bgColor="transparent"
            hoverBgColor="transparent"
            textColor="#475467"
            borderColor="#D0D5DD"
            onClick={navigateToEdit} // Add onClick handler
          >
            Edit
          </ButtonCTA>

          {/* Button share */}
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

export default Header;
