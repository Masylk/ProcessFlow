import React from 'react';

interface TooltipProps {
  text: string;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ text, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
      {/* Content */}
      <div 
        className="px-2 py-1 rounded-lg text-white text-[10px] font-semibold leading-[18px] whitespace-nowrap"
        style={{ 
          backgroundColor: '#4761C4',
          boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
          fontFamily: 'Inter'
        }}
      >
        {text}
      </div>
      {/* Tooltip Arrow */}
      <div 
        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
        style={{ borderTopColor: '#4761C4' }}
      />
    </div>
  );
};

export default Tooltip; 