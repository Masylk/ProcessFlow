import React, { useEffect, useRef } from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

declare global {
  interface Window {
    tui: {
      ImageEditor: new (
        container: HTMLElement,
        options: any
      ) => {
        destroy(): void;
        getImageData(): {
          url: string;
        };
      };
    };
  }
}

export default function ImageEditor({
  imageUrl,
  onClose,
  onSave,
}: ImageEditorProps) {
  const colors = useColors();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add effect to prevent body scrolling when editor is open
  useEffect(() => {
    // Store the original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    // Restore original overflow style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
      onSave(data.filePath);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  useEffect(() => {
    if (containerRef.current && window.tui) {
      const options = {
        includeUI: {
          loadImage: {
            path: imageUrl,
            name: 'Image',
          },
          theme: {
            'common.backgroundColor': colors['bg-primary'],
            'common.border': `1px solid ${colors['border-primary']}`,
            'common.color': colors['text-primary'],
          },
          menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text'],
          initMenu: 'filter',
          menuBarPosition: 'bottom',
          uiSize: {
            width: '100%',
            height: '100%',
          },
        },
        cssMaxWidth: 1000,
        cssMaxHeight: 700,
      };

      editorRef.current = new window.tui.ImageEditor(
        containerRef.current,
        options
      );
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [imageUrl, colors]);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const dataUrl = editorRef.current.toDataURL();
      const imageFile = dataURLtoFile(dataUrl, 'edited-image.png');
      await uploadFile(imageFile);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="relative w-[90vw] h-[90vh] rounded-xl p-6 flex flex-col overflow-hidden"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Edit Image
          </h2>
          <div className="flex gap-2">
            <ButtonNormal onClick={onClose} size="small" variant="secondary">
              Cancel
            </ButtonNormal>
            <ButtonNormal onClick={handleSave} size="small" variant="primary">
              Save
            </ButtonNormal>
          </div>
        </div>

        {/* Editor Container */}
        <div
          ref={containerRef}
          className="flex-1 rounded-lg overflow-hidden"
          style={{ minHeight: '500px' }}
        />
      </div>
    </div>
  );
}
