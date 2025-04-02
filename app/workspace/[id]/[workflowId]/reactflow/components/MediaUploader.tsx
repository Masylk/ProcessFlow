import React, { ChangeEvent, DragEvent, useState } from 'react';
import { Block } from '../../types';
import { useColors } from '@/app/theme/hooks';

interface MediaUploaderProps {
  block: Block;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function MediaUploader({ block, onUpdate }: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = useColors();

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
      className={`flex flex-col justify-center items-center w-full h-[200px] rounded-xl border-2 border-dashed transition-colors cursor-pointer ${isDragOver ? 'bg-opacity-10' : 'hover:bg-opacity-100'}`}
      style={{
        borderColor: isDragOver
          ? colors['button-primary-fg']
          : colors['input-border'],
        backgroundColor: isDragOver
          ? `${colors['button-primary-bg']}10`
          : colors['input-bg-hover'],
      }}
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
        <div
          className="w-10 h-10 p-2.5 rounded-lg border flex justify-center items-center"
          style={{ borderColor: colors['input-border'] }}
        >
          <div className="w-5 h-5 rounded-full flex justify-center items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-cloud-icon.svg`}
              alt="Upload Icon"
              className="w-4 h-4"
            />
          </div>
        </div>
        <div className="self-stretch h-[42px] flex flex-col justify-start items-center gap-1">
          <div className="self-stretch flex justify-center items-center gap-1">
            <div
              className="text-sm font-semibold leading-tight"
              style={{ color: colors['button-secondary-color-fg'] }}
            >
              Click to upload
            </div>
            <div
              className="text-sm font-normal leading-tight"
              style={{ color: colors['input-hint'] }}
            >
              or drag and drop
            </div>
          </div>
          <div
            className="self-stretch text-center text-xs font-normal leading-[18px]"
            style={{ color: colors['input-hint'] }}
          >
            SVG, PNG, JPG or GIF
          </div>
        </div>
      </div>
    </label>
  );
}
