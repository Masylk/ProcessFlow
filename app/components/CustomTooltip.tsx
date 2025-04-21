import React from 'react';

interface CustomTooltipProps {
  /** The text content to display in the tooltip */
  text: string;
  /** Controls the visibility of the tooltip */
  show?: boolean;
  /** Optional CSS class name for additional styling */
  className?: string;
  /** Direction of the tooltip arrow */
  direction?: 'left' | 'right';
}

/**
 * A reusable tooltip component that adapts to the current theme.
 * Displays a message in a floating box with an arrow pointing to the target element.
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  text,
  show = false,
  className = '',
  direction = 'right',
}) => {
  if (!show) return null;

  return (
    <div
      role="tooltip"
      aria-label={text}
      className={`
        absolute px-4 py-2.5
        text-sm text-white leading-5
        bg-[#1D2939] rounded-lg
        shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]
        w-fit whitespace-nowrap
        ${className}
      `}
      style={{
        zIndex: 9999,
        transform: 'translateY(-25%)',
      }}
    >
      <div
        className={`
          absolute ${direction === 'right' ? 'right-full' : 'left-full'} top-[25%]
          border-[6px] border-transparent ${direction === 'right' ? 'border-r-[#1D2939]' : 'border-l-[#1D2939]'}
        `}
        aria-hidden="true"
      />
      {text}
    </div>
  );
};

export default CustomTooltip; 