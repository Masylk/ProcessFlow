import React from 'react';

const PathDropdownPreview = () => {
  return (
    <div className="h-[94px] bg-white rounded-lg shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-[#e4e7ec] justify-start items-start inline-flex overflow-hidden">
      {/* <div className="w-[184px] h-[94px] relative overflow-hidden">
        <div className="w-[105px] h-[73px] left-[30px] top-[9px] absolute"> */}
      <img
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/path-preview.png`}
        alt="Path Preview"
        className="w-full h-full p-1"
      />
    </div>
    //   </div>
    // </div>
  );
};

export default PathDropdownPreview;
