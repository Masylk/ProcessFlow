import React, { ChangeEvent, DragEvent, useState, useEffect, useRef, useCallback } from 'react';
import { Block } from '../../types';
import { useColors } from '@/app/theme/hooks';

interface MediaUploaderProps {
  block: Block;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function MediaUploader({ block, onUpdate }: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [clipboardHasImage, setClipboardHasImage] = useState(false);
  const colors = useColors();
  const containerRef = useRef<HTMLLabelElement>(null);

  // Helper for file validation
  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      alert('Invalid file type. Please select an image file.');
      return false;
    }
    if (file.size > 1024 * 1024) {
      alert('File too large. Image must be less than 1MB.');
      return false;
    }
    return true;
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
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
    if (file && validateFile(file)) {
      await uploadFile(file);
    }
  };

  const uploadFile = useCallback(async (file: File) => {
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
  }, [onUpdate]);

  // Clipboard paste handler
  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    event.preventDefault();
    
    try {
      // Check if we have clipboard items
      if (navigator.clipboard?.read) {
        const clipboardItems = await navigator.clipboard.read();
        
        for (const item of clipboardItems) {
          if (item.types.some(type => type.startsWith('image/'))) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              const file = new File([blob], 'pasted-image.png', { type: imageType });
              
              if (validateFile(file)) {
                await uploadFile(file);
              }
              return;
            }
          }
        }
      }
      
      // Fallback for older browsers or when clipboard.read() isn't available
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && validateFile(file)) {
              await uploadFile(file);
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error pasting image:', error);
      alert('Failed to paste image. Please try uploading manually.');
    }
  }, [validateFile, uploadFile]);

  // Check clipboard content for image
  const checkClipboardForImage = useCallback(async () => {
    try {
      if (navigator.clipboard?.read) {
        const clipboardItems = await navigator.clipboard.read();
        const hasImage = clipboardItems.some(item => 
          item.types.some(type => type.startsWith('image/'))
        );
        setClipboardHasImage(hasImage);
      } else {
        setClipboardHasImage(false);
      }
    } catch (error) {
      // Permission denied or not supported, ignore
      setClipboardHasImage(false);
    }
  }, []);

  // Setup clipboard event listeners
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle paste if this component is visible and the paste is not in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      handlePaste(event);
    };

    // Check clipboard content when component mounts
    checkClipboardForImage();
    
    // Listen for focus to check clipboard again
    const handleFocus = () => checkClipboardForImage();
    
    document.addEventListener('paste', handleGlobalPaste);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handlePaste, checkClipboardForImage]);

  // Keyboard shortcut hint
  const getShortcutText = () => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
    return isMac ? '⌘V' : 'Ctrl+V';
  };

  return (
    <label
      ref={containerRef}
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
          <div className="self-stretch flex flex-col items-center gap-1">
            <div
              className="text-center text-xs font-normal leading-[18px]"
              style={{ color: colors['input-hint'] }}
            >
              SVG, PNG, JPG or GIF
            </div>
            {clipboardHasImage && (
              <div
                className="text-center text-xs font-medium leading-[18px]"
                style={{ color: colors['button-primary-fg'] }}
              >
                Press {getShortcutText()} to paste image
              </div>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}
