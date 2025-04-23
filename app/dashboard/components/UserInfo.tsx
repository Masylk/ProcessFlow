// components/UserInfo.tsx

'use client';

import React from 'react';
import { User } from '@/types/user';

interface UserInfoProps {
  user: User | null;
  isActive?: boolean;
}

export default function UserInfo({ user, isActive = false }: UserInfoProps) {
  // Define the default avatar URL using environment variables.
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;

  // Use user.avatar_signed_url if it exists, otherwise fall back to avatar_url, then default avatar.
  const avatarSrc =
    user && user.avatar_signed_url
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${user.avatar_signed_url}`
      : user && user.avatar_url
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${user.avatar_url}`
        : defaultAvatar;

  return (
    <div
      className={`flex items-center select-none rounded-full border transition-all duration-300 hover:bg-lightMode-bg-primary_hover ${
        isActive 
          ? 'border-[#4E6BD7] shadow-[0px_0px_0px_4px_rgba(78,107,215,0.12)]' 
          : 'border-transparent'
      }`}
      data-testid="user-settings"
      draggable="false"
    >
    
      {/* Avatar */}
      <img
        src={avatarSrc}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover select-none"
        draggable="false"
      />
      
      {/* User Info */}
      <div className="flex flex-col">
        <div className="text-[#101828] text-sm font-semibold hidden">
          {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
        </div>
        <div className="text-[#475467] text-sm hidden">
          {user?.email || 'user@example.com'}
        </div>
      </div>
    </div>
  );
}
