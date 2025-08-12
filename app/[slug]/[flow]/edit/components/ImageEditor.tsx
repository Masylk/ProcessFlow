import React, { useEffect, useRef, useState, useCallback } from 'react';
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ImageEditor Error:', error, errorInfo);
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
  const instanceRef = useRef<any>(null);
  const originalOverflowRef = useRef<string>('');

  // Handle body overflow
  useEffect(() => {
    // Store the original overflow value
    originalOverflowRef.current = window.getComputedStyle(document.body).overflow || '';
    // Set overflow to hidden
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore original overflow
      document.body.style.overflow = originalOverflowRef.current || '';
    };
  }, []);

  // Handle editor initialization
  useEffect(() => {
    let initializationAttempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const checkInstance = () => {
      try {
        initializationAttempts++;
        
        if (initializationAttempts > maxAttempts) {
          setError('Failed to initialize editor');
          setIsLoading(false);
          return true;
        }

        if (editorRef.current?.getInstance) {
          const instance = editorRef.current.getInstance();
          if (instance && instance.invoke) {
            instanceRef.current = instance;
            setIsLoading(false);
            setError(null);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Error getting editor instance:', err);
        if (initializationAttempts > maxAttempts) {
          setError('Failed to initialize editor');
          setIsLoading(false);
          return true;
        }
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
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        try {
          if (typeof instanceRef.current.destroy === 'function') {
            instanceRef.current.destroy();
          }
        } catch (e) {
          console.warn('Error during TUI Image Editor cleanup:', e);
        }
        instanceRef.current = null;
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!instanceRef.current) {
      setError('Editor not ready');
      return;
    }

    try {
      const dataUrl = instanceRef.current.toDataURL();
      if (!dataUrl) {
        throw new Error('Failed to get image data');
      }

      const imageFile = dataURLtoFile(dataUrl, 'edited-image.png');
      await uploadFile(imageFile);
      onClose();
      
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save image');
    }
  }, [onClose]);

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
      throw new Error('Failed to upload file');
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

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleModalClick}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 flex flex-col"
        style={{ 
          backgroundColor: colors['bg-primary'],
          width: '80vw',
          height: '80vh',
        }}
        onClick={handleContentClick}
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
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal 
              onClick={handleSave} 
              size="small" 
              variant="primary"
              disabled={isLoading || !!error}
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
              <div style={{ width: '100%', height: '100%' }}>
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
              </div>
            </ImageEditorErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
