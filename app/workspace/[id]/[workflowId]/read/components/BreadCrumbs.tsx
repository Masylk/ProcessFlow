import React from 'react';

interface BreadCrumbsProps {
  items: string[];
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ items }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseStoragePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH;

  // Construct the URL for the image
  const separatorImageUrl = `${supabaseUrl}${supabaseStoragePath}/assets/shared_components/slash-divider.svg`;

  return (
    <div className="h-7 justify-start items-center inline-flex">
      <div className="justify-start items-center gap-2 flex">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div
              className={`px-2 py-1 rounded-md justify-center items-center flex ${
                index === items.length - 1
                  ? 'bg-[#edf0fb] text-[#374c99] font-semibold'
                  : 'text-[#475467] font-medium'
              }`}
            >
              <div className="text-sm font-['Inter'] leading-tight">{item}</div>
            </div>

            {/* Separator with Image */}
            {index < items.length - 1 && (
              <div className="w-5 h-5 relative overflow-hidden">
                <img
                  src={separatorImageUrl}
                  alt="Separator"
                  className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadCrumbs;
