import React, { useEffect, useRef, useState } from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

// Error boundary component to catch editor errors
class ImageEditorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-lg">Something went wrong with the editor. Please try again.</div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamically import the ImageEditor component with no SSR
const TuiImageEditor = dynamic(
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDestroying, setIsDestroying] = useState(false);
  const instanceRef = useRef<any>(null);
  const originalOverflowRef = useRef<string>('');

  // Handle body overflow
  useEffect(() => {
    // Store the original overflow value
    originalOverflowRef.current = window.getComputedStyle(document.body).overflow;
    // Set overflow to hidden
    document.body.style.overflow = 'hidden';

    const cleanup = () => {
      // Use a small delay to ensure proper cleanup
      setTimeout(() => {
        document.body.style.overflow = originalOverflowRef.current;
      }, 0);
    };

    return cleanup;
  }, []);

  // Handle editor initialization and cleanup
  useEffect(() => {
    const checkInstance = () => {
      try {
        if (editorRef.current?.getInstance) {
          const instance = editorRef.current.getInstance();
          if (instance) {
            instanceRef.current = instance;
            setIsLoading(false);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Error getting editor instance:', err);
        return false;
      }
    };

    const initializeInterval = setInterval(() => {
      if (checkInstance()) {
        clearInterval(initializeInterval);
      }
    }, 100);

    return () => {
      clearInterval(initializeInterval);
      if (instanceRef.current) {
        try {
          const drawingModes = ['CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'];
          drawingModes.forEach(mode => {
            try {
              if (
                instanceRef.current.getDrawingMode &&
                instanceRef.current.getDrawingMode() === mode &&
                instanceRef.current.stopDrawingMode
              ) {
                instanceRef.current.stopDrawingMode();
              }
            } catch (e) {
              // Ignore errors during cleanup
            }
          });
          // Guard destroy
          if (typeof instanceRef.current.destroy === 'function') {
            instanceRef.current.destroy();
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
        instanceRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    if (isLoading) return; // Prevent close while loading
    setIsDestroying(true);
    onClose();
  };

  const handleSave = async () => {
    try {
      if (!instanceRef.current) {
        throw new Error('Editor instance not available');
      }

      const dataUrl = instanceRef.current.toDataURL();
      if (!dataUrl) {
        throw new Error('Failed to get image data');
      }

      const imageFile = dataURLtoFile(dataUrl, 'edited-image.png');
      await uploadFile(imageFile);
      
      setIsDestroying(true);
      onClose();
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save image');
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
      onSave(data.filePath);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
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
      className="fixed inset-0 z-[1000] isolate overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 flex flex-col"
        style={{ 
          backgroundColor: colors['bg-primary'],
          width: '80vw',
          height: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Edit Image
          </h2>
          <div className="flex gap-2">
            <ButtonNormal 
              onClick={handleClose} 
              size="small" 
              variant="secondary"
              disabled={isLoading || isDestroying}
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal 
              onClick={handleSave} 
              size="small" 
              variant="primary"
              disabled={isLoading || isDestroying || !!error}
            >
              Save
            </ButtonNormal>
          </div>
        </div>

        <div className="flex-1 min-h-0 rounded-lg overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <ImageEditorErrorBoundary>
              <TuiImageEditor
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
            </ImageEditorErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
