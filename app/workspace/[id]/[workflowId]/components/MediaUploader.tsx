import React, { ChangeEvent, DragEvent, useState } from 'react';
import { Block } from '@/types/block';

interface MediaUploaderProps {
  block: Block;
  onUpdate: (updatedBlock: Block, imageFile?: File, iconFile?: File) => void;
}

export default function MediaUploader({ block, onUpdate }: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateBlockWithFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); // Prevent default to allow drop
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      updateBlockWithFile(file);
    }
  };

  const updateBlockWithFile = (file: File) => {
    onUpdate(block, file);
  };

  return (
    <label
      htmlFor="media-upload-input"
      className={`h-[126px] px-6 py-4 rounded-xl border flex flex-col justify-start items-center gap-1 cursor-pointer ${
        isDragOver ? 'bg-blue-100 border-blue-400' : 'bg-white border-[#e4e7ec]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id="media-upload-input"
        type="file"
        accept="image/svg+xml, image/png, image/jpeg, image/gif, video/mp4"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="self-stretch h-[94px] flex flex-col justify-start items-center gap-3">
        <div className="w-10 h-10 p-2.5 rounded-lg border border-[#e4e7ec] flex justify-center items-center">
          <div className="w-5 h-5 rounded-full flex justify-center items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-cloud-icon.svg`}
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
    </label>
  );
}
