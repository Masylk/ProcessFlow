import React from 'react';

interface BreadcrumbButtonBaseProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  fontWeight?: string;
}

const BreadcrumbButtonBase: React.FC<BreadcrumbButtonBaseProps> = ({
  text,
  bgColor = '#edf0fb',
  textColor = '#374c99',
  fontWeight = 'font-semibold',
}) => {
  return (
    <div
      className={`px-2 py-1 rounded-md justify-center items-center flex`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`text-sm leading-tight font-['Inter'] ${fontWeight}`}
        style={{ color: textColor }}
      >
        {text}
      </div>
    </div>
  );
};

export default BreadcrumbButtonBase;
