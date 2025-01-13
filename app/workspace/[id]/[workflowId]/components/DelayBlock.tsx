import React from 'react';
import { Block } from '@/types/block';

const DelayBlock: React.FC<{ block: Block }> = ({ block }) => {
  const delay = block.delayBlock?.seconds ?? 0; // Fallback to 0 if delayBlock or delay is undefined

  return (
    <div
      id={`block:${block.id}`}
      className="h-[25px] pl-1.5 pr-2 bg-[#fcead7] rounded-full shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] border border-[#fe692d] justify-start items-center gap-1 inline-flex"
    >
      <img
        src="/assets/workflow/delay-clock-icon.svg"
        alt="Delay Icon"
        className="w-[10.51px] h-[10.51px]"
      />
      <div className="text-center text-[#b54707] text-xs font-medium font-['Inter'] leading-[18px]">
        Delay: {delay}min
      </div>
    </div>
  );
};

export default DelayBlock;

// New style
// function formatDelay(seconds: number) {
//   const days = Math.floor(seconds / (24 * 3600));
//   const hours = Math.floor((seconds % (24 * 3600)) / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);

//   const parts = [];
//   if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
//   if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
//   if (minutes > 0 || parts.length === 0) {
//     parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
//   }

//   return parts.length > 1
//     ? parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1)
//     : parts[0];
// }
//   {/* Delay Block */}
//   <div className="h-[124px] px-6 py-5 bg-white rounded-2xl shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] flex flex-col justify-start items-start gap-3 overflow-hidden">
//   {/* Top Row: Icon, Text, and Dots */}
//   <div className="w-full flex justify-between items-center">
//     {/* Left Section: Delay Icon and Text */}
//     <div className="flex items-center gap-4">
//       <div className="w-12 h-12 p-3 bg-white rounded-[13.50px] border border-[#e4e7ec] justify-center items-center flex overflow-hidden">
//         <img
//           src="/assets/workflow/adddelay-icon.svg"
//           alt="Delay Icon"
//           className="w-6 h-6"
//         />
//       </div>
//       <div className="flex flex-col justify-start items-start">
//         <div className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
//           Delay
//         </div>
//       </div>
//     </div>

//     {/* Right Section: Dots Icon */}
//     <div className="w-6 h-6 flex justify-center items-center">
//       <img
//         src="/assets/shared_components/dots-horizontal.svg"
//         alt="Options"
//         className="w-6 h-6"
//       />
//     </div>
//   </div>

//   {/* Bottom Row: Delay Description */}
//   <div className="w-full">
//     <span className="text-[#667085] text-base font-normal font-['Inter'] leading-normal">
//       Wait{' '}
//     </span>
//     <span className="text-[#475467] text-base font-semibold font-['Inter'] leading-normal">
//       {formatDelay(block.delay)}
//     </span>
//   </div>
// </div>
