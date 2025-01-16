import React, { useEffect, useState } from 'react';
import BreadcrumbButtonBase from './BreadcrumbButtonBase';
import { supabasePublic } from '@/lib/supabasePublicClient';

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
  const [dividerUrl, setDividerUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDividerUrl = async () => {
      const { data } = supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('assets/shared_components/slash-divider.svg');
      setDividerUrl(data?.publicUrl || null);
    };

    fetchDividerUrl();
  }, []);

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
        {dividerUrl && (
          <img src={dividerUrl} alt="Divider" className="w-5 h-5" />
        )}
        {/* Ellipsis */}
        <BreadcrumbButtonBase
          text="..."
          bgColor="transparent"
          textColor="#475467"
          fontWeight="font-medium"
        />
        {/* Divider */}
        {dividerUrl && (
          <img src={dividerUrl} alt="Divider" className="w-5 h-5" />
        )}
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
