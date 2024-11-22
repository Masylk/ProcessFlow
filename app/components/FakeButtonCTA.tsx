import React, { ReactNode } from 'react';

interface FakeButtonCTAProps {
  children: ReactNode;
  start_icon?: string;
  end_icon?: string;
  bgColor?: string; // Background color
  textColor?: string; // Text color
}

const FakeButtonCTA: React.FC<FakeButtonCTAProps> = ({
  children,
  start_icon,
  end_icon,
  bgColor = '#4e6bd7', // Default background color
  textColor = 'white', // Default text color
}) => {
  return (
    <div
      className={`h-9 px-3 py-2 rounded-lg border justify-center items-center gap-1 inline-flex 
        border-white focus:outline-none focus:ring-2 focus:ring-offset-2 group 
        ${bgColor !== 'transparent' ? 'shadow' : ''} 
        transition-all duration-200 ease-in-out`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: bgColor,
      }}
    >
      {/* Start Icon */}
      {start_icon && (
        <div className="w-5 h-5 justify-center items-center flex">
          <img src={start_icon} alt="Start Icon" className="w-full h-full" />
        </div>
      )}
      {/* Button Text */}
      <div className="px-0.5 justify-center items-center flex">
        <div className="text-sm font-semibold font-['Inter'] leading-tight">
          {children}
        </div>
      </div>
      {/* End Icon */}
      {end_icon && (
        <div className="w-5 h-5 justify-center items-center flex">
          <img src={end_icon} alt="End Icon" className="w-full h-full" />
        </div>
      )}
    </div>
  );
};

export default FakeButtonCTA;
