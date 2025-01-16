import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import { supabasePublic } from '@/lib/supabasePublicClient';

function formatDelay(seconds: number) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  return parts.length > 1
    ? parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1)
    : parts[0];
}

const DelayBlock: React.FC<{ block: Block }> = ({ block }) => {
  const delay = block.delayBlock?.seconds ?? 0; // Fallback to 0 if delayBlock or delay is undefined
  const [clockUrl, setClockUrl] = useState<string>('');
  const [dotUrl, setDotUrl] = useState<string>('');

  useEffect(() => {
    const fetchPublicUrl = async (path: string) => {
      const { data } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl(path);

      return data?.publicUrl || '';
    };

    const getPublicUrl = async () => {
      setClockUrl(
        await fetchPublicUrl('/assets/workflow/clock-stopwatch-orange.svg')
      );
      setDotUrl(
        await fetchPublicUrl('/assets/shared_components/dots-horizontal.svg')
      );
    };

    getPublicUrl();
  }, []);
  return (
    <div className="w-[481px] h-[124px] px-6 py-5 bg-[#FDEAD7] rounded-2xl shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] flex flex-col justify-start items-start gap-3 overflow-hidden">
      {/* Top Row: Icon, Text, and Dots */}
      <div className="w-full flex justify-between items-center">
        {/* Left Section: Delay Icon and Text */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 p-3 bg-[#FDEAD7] rounded-[13.50px] border border-[#FFE5D5] justify-center items-center flex overflow-hidden">
            <img src={clockUrl} alt="Delay Icon" className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#E04F16] text-base font-semibold font-['Inter'] leading-normal">
              Delay
            </div>
          </div>
        </div>

        {/* Right Section: Dots Icon */}
        <div className="w-6 h-6 flex justify-center items-center">
          <img src={dotUrl} alt="Options" className="w-6 h-6" />
        </div>
      </div>

      {/* Bottom Row: Delay Description */}
      <div className="w-full">
        <span className="text-[#E04F16] text-base font-normal font-['Inter'] leading-normal">
          Wait{' '}
        </span>
        <span className="text-[#E04F16] text-base font-semibold font-['Inter'] leading-normal">
          {formatDelay(delay)}
        </span>
      </div>
    </div>
  );
};

export default DelayBlock;
