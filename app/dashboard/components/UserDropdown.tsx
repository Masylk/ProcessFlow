'use client';

import React, { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/user';
import { redirectToRoadmap } from '@/app/utils/roadmap';
import { useColors } from '@/app/theme/hooks';

interface UserDropdownProps {
  user: User | null;
  onOpenUserSettings: () => void;
  onOpenHelpCenter: () => void;
  onClose: () => void;
}

export default function UserDropdown({
  user,
  onOpenUserSettings,
  onOpenHelpCenter,
  onClose,
}: UserDropdownProps) {
  const colors = useColors();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Successfully logged out');
      window.location.href = '/login';
    }
  };

  const handleRoadmapClick = async () => {
    try {
      // Get authenticated user
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      console.log('Authenticated user:', authUser);
      console.log('User prop:', user);

      if (authUser && user) {
        console.log('User data being sent to roadmap:', {
          email: user.email,
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url
        });
        await redirectToRoadmap(user);
      } else {
        console.error('Authentication check failed:', {
          hasAuthUser: !!authUser,
          hasUserProp: !!user
        });
      }
    } catch (error) {
      console.error('Error in handleRoadmapClick:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      style={{
        backgroundColor: colors['bg-secondary'],
        borderColor: colors['border-primary']
      }}
      className="h-full rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 border flex-col justify-start items-start inline-flex overflow-hidden"
    >
      <div className="h-full flex-col justify-start items-start flex overflow-hidden">
        {/* Settings Item */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={() => {
            onOpenUserSettings();
            onClose();
          }}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/user-profile.svg`}
                  alt="Settings Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Account settings
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line spacer */}
        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1" />

        {/* Changelog & Roadmap Item */}
        <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
          <div
            onClick={handleRoadmapClick}
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="cursor-pointer grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/compass-icon.svg`}
                  alt="Compass Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Changelog &amp; Roadmap
              </div>
            </div>
          </div>
        </div>

        {/* Slack community */}
        <a
          href="https://join.slack.com/t/processflowcommunity/shared_invite/zt-2z10aormq-aFsRf5mw1~~Y~ryFXgrwog"
          target="_blank"
          rel="noopener noreferrer"
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slack.svg`}
                  alt="Slack Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Slack Community
              </div>
            </div>
          </div>
        </a>

        {/* Support Item */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={() => {
            onOpenHelpCenter();
            onClose();
          }}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                  alt="Support Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Support
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line spacer */}
        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1" />

        {/* Log out Item */}
        <div 
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={handleLogout}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                  alt="Log Out Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Log out
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
