'use client';

import { useState, createContext } from 'react';
import { useTheme, useColors } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';
import BreadCrumbs from './BreadCrumbs';
import ButtonNormal from '@/app/components/ButtonNormal';
import Image from 'next/image';
import Link from 'next/link';
import UserInfo from '@/app/dashboard/components/UserInfo';
import UserDropdown from '@/app/dashboard/components/UserDropdown';
import { User } from '@/types/user';
import ShareModal from '@/app/components/ShareModal';
import { AnimatePresence } from 'framer-motion';
import { Workspace } from '@/types/workspace';

import { usePathname, useRouter } from 'next/navigation';
import { createEditLink } from '../../utils/createLinks';

export const HeaderHeightContext = createContext<number>(0);

interface HeaderProps {
  breadcrumbItems: Array<{
    label: string;
    href?: string;
  }>;
  user: User;
  className?: string;
  onOpenUserSettings: () => void;
  onOpenHelpCenter: () => void;
  params?: {
    id: string;
    workflowId: string;
    slug: string;
  };
  is_public?: boolean;
  onToggleAccess: () => void;
  shareUrl: string;
  workflowTitle?: string;
  workspace?: Workspace;
}

const Header: React.FC<HeaderProps> = ({
  breadcrumbItems,
  user,
  className,
  workflowTitle,
  onOpenUserSettings,
  onOpenHelpCenter,
  params,
  is_public = false,
  onToggleAccess,
  shareUrl,
  workspace,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getCssVariable } = useTheme();
  const colors = useColors();
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const headerHeight = 57; // Define the height here

  const handleUserInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  // Example messages - in a real app, these would come from your backend
  const exampleMessages = [
    {
      id: '1',
      user: {
        name: 'Lana Steiner',
        avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
        isOnline: true,
      },
      message:
        'Hey! I think the 1st step should be more direct. Here is an example',
      timestamp: 'Thursday 11:40am',
    },
    {
      id: '2',
      user: {
        name: 'Lana Steiner',
        avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
        isOnline: true,
      },
      attachment: {
        name: 'Onboarding.pdf',
        type: 'pdf',
        size: '1.2 MB',
      },
      timestamp: 'Thursday 11:40am',
    },
    {
      id: '3',
      isYou: true,
      user: {
        name: 'You',
        avatar:
          user.avatar_url ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
      },
      message: 'Awesome! Thanks.',
      timestamp: 'Thursday 11:41am',
    },
    {
      id: '4',
      user: {
        name: 'Demi Wilkinson',
        avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
        isOnline: true,
      },
      message: 'Good timing — was just looking at this.',
      timestamp: 'Thursday 11:44am',
    },
    {
      id: '5',
      user: {
        name: 'Phoenix Baker',
        avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
        isOnline: true,
      },
      message: 'Hey Olivia, can you please review the process date?',
      timestamp: 'Friday 2:20pm',
    },
    {
      id: '6',
      isYou: true,
      user: {
        name: 'You',
        avatar:
          user.avatar_url ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/default-avatar.svg`,
      },
      message: "Sure thing, I'll have a look today.",
      timestamp: 'Friday 2:20pm',
    },
  ];

  const navigateToEdit = () => {
    if (!params?.workflowId || !params?.slug || !workflowTitle) {
      console.error('Missing required parameters', params, workflowTitle);
      return;
    }
    const editPath = createEditLink(
      workflowTitle,
      params?.workflowId,
      params?.slug
    );
    router.push(editPath);
  };

  const handleSendMessage = (message: string) => {
    // In a real app, this would send the message to your backend
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <HeaderHeightContext.Provider value={headerHeight}>
      <header
        className={cn('w-full flex items-center justify-between', 'border-b')}
        style={{
          borderColor: colors['border-secondary'],
          backgroundColor: colors['bg-primary'],
          height: `${headerHeight}px`,
          padding: '0 16px',
        }}
      >
        <div className="flex items-center gap-2">
          <ButtonNormal
            variant="tertiary"
            size="small"
            iconOnly
            className="!p-2"
            onClick={() => window.history.back()}
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
          />
          <BreadCrumbs items={breadcrumbItems} />
        </div>

        <div className="flex items-center gap-3">
          {/* Edit Button */}
          <ButtonNormal
            variant="secondary"
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-06.svg`}
            onClick={navigateToEdit}
          >
            Edit
          </ButtonNormal>

          {/* Share Button */}
          <ButtonNormal
            variant="primary"
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/share-06.svg`}
            onClick={openShareModal}
          >
            Share
          </ButtonNormal>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <div
              className="relative cursor-pointer"
              onClick={handleUserInfoClick}
            >
              <UserInfo user={user} isActive={dropdownVisible} />
              <AnimatePresence>
                {dropdownVisible && (
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownVisible(false)}
                  >
                    <div
                      className="absolute top-[68px] right-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserDropdown
                        user={user}
                        onOpenUserSettings={onOpenUserSettings}
                        onOpenHelpCenter={onOpenHelpCenter}
                        onClose={() => setDropdownVisible(false)}
                      />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        itemName={
          breadcrumbItems[breadcrumbItems.length - 1]?.label ||
          'Untitled Workflow'
        }
        params={params}
        is_public={is_public}
        onToggleAccess={onToggleAccess}
        shareUrl={shareUrl}
        workspace={workspace}
      />
    </HeaderHeightContext.Provider>
  );
};

export default Header;
