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

  // Use user.avatar_url if it exists, otherwise fall back to the default avatar.
  const avatarSrc =
    user && user.avatar_signed_url
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${user.avatar_signed_url}`
      : defaultAvatar;

  return (
    <div
      className={`flex items-center gap-4 px-3 py-1 rounded-lg border transition-all duration-300 hover:bg-lightMode-bg-primary_hover ${
        isActive 
          ? 'border-[#4E6BD7] shadow-[0px_0px_0px_4px_rgba(78,107,215,0.12)]' 
          : 'border-transparent'
      }`}
    >
    
      {/* Avatar */}
      <img
        src={avatarSrc}
        alt="User Avatar"
        className="w-8 h-8 rounded-full object-cover"
      />
      
      {/* User Info */}
      <div className="flex flex-col">
        <div className="text-[#101828] text-sm font-semibold">
          {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
        </div>
        <div className="text-[#475467] text-sm">
          {user?.email || 'user@example.com'}
        </div>
      </div>
    </div>
  );
}
