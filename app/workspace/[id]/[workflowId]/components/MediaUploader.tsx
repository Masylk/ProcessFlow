import React from 'react';

interface MediaUploaderProps {
  onUpload: (file: File) => void;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="h-[126px] px-6 py-4 bg-white rounded-xl border border-[#e4e7ec] flex flex-col justify-start items-center gap-1">
      <div className="self-stretch h-[94px] flex flex-col justify-start items-center gap-3">
        <div className="w-10 h-10 p-2.5 bg-white rounded-lg shadow shadow-inner border border-[#e4e7ec] flex justify-center items-center">
          <div className="w-5 h-5 bg-gray-200 rounded-full flex justify-center items-center">
            <img
              src="/assets/shared_components/upload-cloud-icon.svg"
              alt="Upload Icon"
              className="w-4 h-4"
            />
          </div>
        </div>
        <div className="self-stretch h-[42px] flex flex-col justify-start items-center gap-1">
          <div className="self-stretch flex justify-center items-center gap-3">
            <div className="text-[#374c99] text-sm font-semibold leading-tight">
              Click to upload
            </div>
            <div className="text-[#475467] text-sm font-normal leading-tight">
              or drag and drop
            </div>
          </div>
          <div className="self-stretch text-center text-[#475467] text-xs font-normal leading-[18px]">
            SVG, PNG, JPG, GIF, or MP4
          </div>
        </div>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".svg,.png,.jpg,.jpeg,.gif,.mp4"
      />
    </div>
  );
}
