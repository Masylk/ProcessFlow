'use client';

// components/UserDropdown.tsx
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/user';
import HelpCenterModal from './HelpCenterModal'; // Si besoin, ce composant n'est plus utilisé ici puisque le modal est géré par le parent

interface UserDropdownProps {
  user: User | null;
  onOpenUserSettings: () => void;
  onOpenHelpCenter: () => void; // Nouvelle prop pour ouvrir le Help Center
}

export default function UserDropdown({
  user,
  onOpenUserSettings,
  onOpenHelpCenter,
}: UserDropdownProps) {
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Successfully logged out');
      window.location.href = '/login';
    }
  };

  const handleRoadmapClick = () => {
    window.location.href = 'https://processflow.features.vote/roadmap';
  };

  return (
    <>
      <div className="h-full bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] border border-[#e4e7ec] flex-col justify-start items-start inline-flex overflow-hidden">
        <div className="h-full py-1 flex-col justify-start items-start flex overflow-hidden">
          {/* Settings Item */}
          <div
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
            onClick={onOpenUserSettings}
          >
            <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden">
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                    alt="Settings Icon"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Settings
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal line spacer */}
          <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />

          {/* Changelog & Roadmap Item */}
          <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
            <div
              onClick={handleRoadmapClick}
              className="cursor-pointer grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden"
            >
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/compass-icon.svg`}
                    alt="Compass Icon"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Changelog &amp; Roadmap
                </div>
              </div>
            </div>
          </div>

          {/* Support Item */}
          <div
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
            onClick={onOpenHelpCenter}
          >
            <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden">
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                    alt="Support Icon"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Support
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal line spacer */}
          <div className="self-stretch h-px bg-[#e4e7ec] border-t my-1" />

          {/* Log out Item */}
          <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
            <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden">
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                    alt="Log Out Icon"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div
                  onClick={handleLogout}
                  className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight cursor-pointer"
                >
                  Log out
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
