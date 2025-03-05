// components/HelpCenterModal.tsx
import { User } from '@/types/user';
import { redirectToRoadmap } from '@/app/utils/roadmap';
import { useColors } from '@/app/theme/hooks';

interface HelpCenterModalProps {
  onClose: () => void;
  user: User;
}

export default function HelpCenterModal({
  onClose,
  user,
}: HelpCenterModalProps) {
  const colors = useColors();

  const handleRoadmapClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      await redirectToRoadmap(user);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      {/* Modal content */}
      <div 
        className="relative z-10 w-[480px] rounded-xl shadow-lg flex flex-col items-center overflow-hidden"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-4 rounded-md transition duration-300"
          style={{ 
            '--hover-bg': colors['bg-quaternary'],
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors['bg-quaternary'];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
            alt="Close"
            className="w-6 h-6"
          />
        </button>

        <div className="self-stretch flex flex-col items-center">
          <div className="self-stretch px-6 pt-6 flex items-start gap-4">
            {/* Support Icon */}
            <div 
              className="p-3 rounded-full flex justify-center items-center overflow-hidden"
              style={{ backgroundColor: colors['bg-secondary'] }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                alt="Support Icon"
                className="w-6"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="w-[432px] flex flex-col justify-center gap-1">
              <div 
                className="text-lg font-semibold leading-7"
                style={{ color: colors['text-primary'] }}
              >
                Help center
              </div>
              <div 
                className="text-sm font-normal leading-tight"
                style={{ color: colors['text-secondary'] }}
              >
                Everything you need
              </div>
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="self-stretch p-6 flex flex-col gap-5">
          {/* Reach out to us */}
          <a
            href="mailto:contact@process-flow.io"
            className="self-stretch px-1.5 py-px flex items-center rounded-lg transition-colors duration-200"
            style={{ 
              '--hover-bg': colors['bg-quaternary'],
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors['bg-quaternary'];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Certificate Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/certificate.svg`}
                    alt="Certificate Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div 
                  className="text-sm font-medium leading-tight"
                  style={{ color: colors['text-secondary'] }}
                >
                  Reach out to us
                </div>
              </div>
              <div 
                className="text-xs font-normal leading-[18px]"
                style={{ color: colors['text-secondary'] }}
              >
                ⌘S
              </div>
            </div>
          </a>

          {/* Take a look at our roadmap */}
          <a
            href="#"
            onClick={handleRoadmapClick}
            className="self-stretch px-1.5 py-px flex items-center rounded-lg transition-colors duration-200"
            style={{ 
              '--hover-bg': colors['bg-quaternary'],
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors['bg-quaternary'];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Compass Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/compass-icon.svg`}
                    alt="Compass Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div 
                  className="text-sm font-medium leading-tight"
                  style={{ color: colors['text-secondary'] }}
                >
                  Take a look at our roadmap
                </div>
              </div>
              <div 
                className="text-xs font-normal leading-[18px]"
                style={{ color: colors['text-secondary'] }}
              >
                ⌘D
              </div>
            </div>
          </a>

          {/* Join our Slack community */}
          <a
            href="https://join.slack.com/t/processflowcommunity/shared_invite/zt-2z10aormq-aFsRf5mw1~~Y~ryFXgrwog"
            target="_blank"
            rel="noopener noreferrer"
            className="self-stretch px-1.5 py-px flex items-center rounded-lg transition-colors duration-200"
            style={{ 
              '--hover-bg': colors['bg-quaternary'],
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors['bg-quaternary'];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Slack Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slack.svg`}
                    alt="Slack Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div 
                  className="text-sm font-medium leading-tight"
                  style={{ color: colors['text-secondary'] }}
                >
                  Join our Slack community
                </div>
              </div>
              <div 
                className="text-xs font-normal leading-[18px]"
                style={{ color: colors['text-secondary'] }}
              >
                ⌘X
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
