import ButtonCTA from '@/app/components/ButtonCTA';
import React from 'react';
// import TitleBar from './TitleBar';
import { useRouter } from 'next/navigation';
import FakeButtonCTA from '@/app/components/FakeButtonCTA';
import AvatarGroup from '@/app/components/AvatarGroup';

interface HeaderProps {
  currentPath: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const router = useRouter();

  // URLs for avatars
  const avatarUrls = [
    '/images/placeholder-avatar1.png',
    '/images/placeholder-avatar2.png',
    '/images/placeholder-avatar3.png',
  ];

  return (
    <div className="overflow-hidden w-full h-[68px] p-4 bg-white border-b border-[#e4e7ec] flex justify-between items-center z-40">
      {/* Back to Dashboard Section */}
      <ButtonCTA
        start_icon="/assets/shared_components/arrow-left.svg"
        onClick={() => router.back()}
        bgColor="transparent"
        hoverBgColor="transparent"
        textColor="#475467"
      >
        Back to Dashboard
      </ButtonCTA>

      {/* Breadcrumb Section */}
      <div className="pl-24 flex items-center">
        {/* <TitleBar title={workflowTitle} onUpdateTitle={updateWorkflowTitle} /> */}
      </div>

      {/* Action Section */}
      <div className="flex items-center gap-4">
        {/* User Avatars */}
        <AvatarGroup urls={avatarUrls} />

        {/* Button Section with Line */}
        <div className="pl-4 border-l border-[#d0d5dd] justify-start items-center gap-2 flex">
          {/* Button saved disabled */}
          <FakeButtonCTA
            start_icon="/assets/shared_components/cloud.svg"
            bgColor="transparent"
            textColor="#475467"
          >
            Saved
          </FakeButtonCTA>

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
