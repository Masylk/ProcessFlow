import React, { useEffect, useRef, useState } from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

// Dynamically import the ImageEditor component with no SSR
const ImageEditor = dynamic(
  () => import('@toast-ui/react-image-editor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-gray-100/50">
        <div className="text-lg">Loading editor...</div>
      </div>
    )
  }
);

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

export default function ImageEditorModal({
  imageUrl,
  onClose,
  onSave,
}: ImageEditorProps) {
  const colors = useColors();
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Add effect to prevent body scrolling when editor is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Effect to handle editor initialization
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current?.getInstance()) {
        try {
          editorRef.current.getInstance().destroy();
        } catch (err) {
          console.error('Error destroying editor:', err);
        }
      }
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

  const handleSave = async () => {
    if (editorRef.current?.getInstance()) {
      try {
        const instance = editorRef.current.getInstance();
        const dataUrl = instance.toDataURL();
        const imageFile = dataURLtoFile(dataUrl, 'edited-image.png');
        await uploadFile(imageFile);
        onClose();
      } catch (err) {
        console.error('Error saving image:', err);
      }
    }
  };

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
        <div className="flex-1 rounded-lg overflow-hidden">
          {isReady && (
            <ImageEditor
              ref={editorRef}
              includeUI={{
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
              }}
              cssMaxHeight={700}
              cssMaxWidth={1000}
              selectionStyle={{
                cornerSize: 20,
                rotatingPointOffset: 70,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
