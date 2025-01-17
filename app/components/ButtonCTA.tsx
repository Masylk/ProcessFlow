import React, {
  ReactNode,
  ButtonHTMLAttributes,
  useState,
  useEffect,
} from 'react';

interface ButtonCTAProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode; // Make children optional
  start_icon?: string; // Path to the start icon in Supabase
  end_icon?: string; // Path to the end icon in Supabase
  bgColor?: string; // Background color when not disabled
  textColor?: string; // Text color when not disabled
  hoverBgColor?: string; // Hover background color when not disabled
  borderColor?: string; // Border color when not disabled
}

const ButtonCTA: React.FC<ButtonCTAProps> = ({
  children,
  disabled,
  start_icon,
  end_icon,
  bgColor = '#4e6bd7', // Default background color
  textColor = 'white', // Default text color
  hoverBgColor = '#374c99', // Default hover background color
  borderColor = 'transparent', // Default border color
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}`;
  const startIconUrl = start_icon ? `${baseUrl}/${start_icon}` : null;
  const endIconUrl = end_icon ? `${baseUrl}/${end_icon}` : null;

  return (
    <button
      className={`h-9 px-3 py-2 rounded-lg border justify-center items-center gap-1 inline-flex 
        ${
          disabled
            ? 'bg-[#f2f4f7] border-[#e4e7ec] text-[#98a1b2] cursor-not-allowed'
            : 'focus:outline-none group'
        } 
        ${
          bgColor !== 'transparent'
            ? 'shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18),inset_0px_-2px_0px_rgba(16,24,40,0.05),0px_1px_2px_rgba(16,24,40,0.05)]'
            : ''
        } 
        transition-all duration-200 ease-in-out`}
      style={{
        backgroundColor: disabled
          ? undefined
          : isHovered
          ? hoverBgColor
          : bgColor,
        color: disabled ? undefined : textColor,
        borderColor: disabled ? undefined : borderColor,
        outline: 'none', // Remove the outline
      }}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)} // Handle hover state
      onMouseLeave={() => !disabled && setIsHovered(false)} // Reset hover state
      {...props}
    >
      {/* Start Icon */}
      {startIconUrl && (
        <div className="w-5 h-5 justify-center items-center flex">
          <img src={startIconUrl} alt="Start Icon" className="w-full h-full" />
        </div>
      )}

      {/* Button Text (Only rendered if there's text content) */}
      {children && (
        <div className="px-0.5 justify-center items-center flex">
          <div className="text-sm font-semibold leading-tight">{children}</div>
        </div>
      )}

      {/* End Icon */}
      {endIconUrl && (
        <div className="w-5 h-5 justify-center items-center flex">
          <img src={endIconUrl} alt="End Icon" className="w-full h-full" />
        </div>
      )}
    </button>
  );
};

export default ButtonCTA;
