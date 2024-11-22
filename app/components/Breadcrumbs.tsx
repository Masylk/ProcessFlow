import React from 'react';
import BreadcrumbButtonBase from './BreadcrumbButtonBase';

interface BreadcrumbsProps {
  first_text: string;
  second_text: string;
  onSecondTextClick?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  first_text,
  second_text,
  onSecondTextClick,
}) => {
  return (
    <div className="h-7 justify-start items-center inline-flex">
      <div className="justify-start items-center gap-2 flex">
        {/* First Breadcrumb */}
        <BreadcrumbButtonBase
          text={first_text}
          bgColor="transparent"
          textColor="#475467"
          fontWeight="font-medium"
        />
        {/* Divider */}
        <img
          src="/assets/shared_components/slash-divider.svg"
          alt="Divider"
          className="w-5 h-5"
        />
        {/* Ellipsis */}
        <BreadcrumbButtonBase
          text="..."
          bgColor="transparent"
          textColor="#475467"
          fontWeight="font-medium"
        />
        {/* Divider */}
        <img
          src="/assets/shared_components/slash-divider.svg"
          alt="Divider"
          className="w-5 h-5"
        />
        {/* Second Breadcrumb */}
        <div onClick={onSecondTextClick} className="cursor-pointer">
          <BreadcrumbButtonBase
            text={second_text}
            bgColor="#edf0fb"
            textColor="#374c99"
            fontWeight="font-semibold"
          />
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
