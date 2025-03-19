import React, { ChangeEvent, DragEvent, useState } from 'react';
import { Block } from '../types';

interface MediaUploaderProps {
  block: Block;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function MediaUploader({ block, onUpdate }: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpdate({ image: data.filePath });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <label
      className={`flex flex-col justify-center items-center w-full h-[267px] rounded-xl border-2 border-dashed transition-colors cursor-pointer
        ${isDragOver ? 'border-[#374c99] bg-[#f5f8ff]' : 'border-[#e4e7ec] hover:bg-gray-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
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
            SVG, PNG, JPG or GIF
          </div>
        </div>
      </div>
    </label>
  );
} 