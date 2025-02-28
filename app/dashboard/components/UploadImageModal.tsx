import { useState, useRef } from 'react';
import { useColors } from '@/app/theme/hooks';

interface UploadImageModalProps {
  onClose: () => void;
  onSave: (file: File) => void;
}

export default function UploadImageModal({
  onClose,
  onSave,
}: UploadImageModalProps) {
  const colors = useColors();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedFile(null);
  };

  return (
    <main 
      className="fixed inset-0 flex items-center justify-center z-50 w-full"
      onClick={onClose}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      {/* Modal */}
      <div 
        className="relative w-[480px] rounded-xl shadow-lg flex flex-col justify-start items-center overflow-hidden z-10"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-40 flex flex-col justify-start items-center">
          <div className="w-full h-[140px] px-6 pt-6 flex flex-col justify-start items-start gap-4">
            {/* Image Icon */}
            <div 
              className="w-12 h-12 p-3 rounded-[10px] shadow-sm flex justify-center items-center overflow-hidden"
              style={{ 
                backgroundColor: colors['bg-secondary'],
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors['border-secondary']
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/image-03.svg`}
                alt="Image Icon"
                className="w-6 h-6"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <h2 
                className="text-lg font-semibold"
                style={{ color: colors['text-primary'] }}
              >
                {selectedFile
                  ? 'Selected File'
                  : 'Drop an image here or click to upload'}
              </h2>
              <p 
                className="text-sm font-normal"
                style={{ color: colors['text-secondary'] }}
              >
                Upload your profile picture
              </p>
            </div>
          </div>
        </div>

        {/* Conditionally Show Upload Area or File Info */}
        <div className="w-full px-6 flex flex-col justify-start items-start gap-5">
          {!selectedFile ? (
            // Upload Area
            <div
              className="w-full h-[126px] px-6 py-4 rounded-xl border-2 flex flex-col justify-start items-center gap-1 group transition-all duration-300 cursor-pointer"
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
                '--hover-border': colors['text-accent']
              } as React.CSSProperties}
              onClick={handleUploadAreaClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors['text-accent'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors['border-secondary'];
              }}
            >
              <div className="w-full h-[94px] flex flex-col justify-start items-center gap-3">
                {/* Upload Icon */}
                <div 
                  className="w-10 h-10 p-2.5 rounded-lg shadow border flex justify-center items-center overflow-hidden"
                  style={{ 
                    backgroundColor: colors['bg-secondary'],
                    borderColor: colors['border-secondary']
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-cloud-02.svg`}
                    alt="Upload Cloud"
                    className="w-5 h-5"
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-center gap-1">
                  <div className="flex justify-center items-start gap-1">
                    <span 
                      className="text-sm font-semibold cursor-pointer transition-all duration-300"
                      style={{ 
                        color: colors['text-accent'],
                        '--hover-color': colors['text-accent-hover']
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors['text-accent-hover'];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors['text-accent'];
                      }}
                    >
                      Click to upload
                    </span>
                    <span 
                      className="text-sm font-normal"
                      style={{ color: colors['text-secondary'] }}
                    >
                      or drag and drop
                    </span>
                  </div>
                  <p 
                    className="text-center text-xs font-normal"
                    style={{ color: colors['text-secondary'] }}
                  >
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Selected File Display
            <div 
              className="h-[72px] w-full p-4 rounded-xl border justify-start items-start gap-1 inline-flex"
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary']
              }}
            >
              <div className="grow shrink basis-0 h-10 justify-start items-start gap-3 flex">
                <div className="w-10 h-10 relative">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/page-icon.svg`}
                    alt="Delete Icon"
                    className="w-8 h-10 left-[5px] top-[0px] absolute"
                  />
                  <div 
                    className="px-[3px] py-0.5 left-[1px] top-[15px] absolute rounded-sm justify-start items-start gap-2 inline-flex"
                    style={{ backgroundColor: colors['text-accent'] }}
                  >
                    <div className="text-center text-white text-[10px] font-bold font-['Inter']">
                      IMG
                    </div>
                  </div>
                </div>
                <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                  <div className="self-stretch h-10 flex-col justify-start items-start flex">
                    <div 
                      className="self-stretch text-sm font-medium font-['Inter'] leading-tight"
                      style={{ color: colors['text-primary'] }}
                    >
                      {selectedFile.name}
                    </div>
                    <div 
                      className="self-stretch pt-1 text-sm font-normal font-['Inter'] leading-tight"
                      style={{ color: colors['text-secondary'] }}
                    >
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-0 rounded-lg gap-2 overflow-hidden">
                <button
                  onClick={handleRemoveFile}
                  className="w-5 h-5 transition-all duration-300"
                  style={{ 
                    color: colors['text-accent'],
                    '--hover-color': colors['text-accent-hover']
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors['text-accent-hover'];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors['text-accent'];
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon.svg`}
                    alt="Delete Icon"
                    className="w-5 h-5 object-contain"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Buttons Section */}
        <div className="w-full h-[100px] pt-8 flex flex-col justify-start items-start">
          <div className="w-full px-6 pb-6 flex items-center gap-3">
            {/* Cancel Button */}
            <button
              onClick={() => onClose()}
              className="w-full h-11 px-4 py-2.5 rounded-lg shadow border flex justify-center items-center gap-1.5 transition-all duration-300"
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
                '--hover-bg': colors['bg-secondary']
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-secondary'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-primary'];
              }}
            >
              <span 
                className="text-base font-semibold"
                style={{ color: colors['text-primary'] }}
              >
                Cancel
              </span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                if (selectedFile) {
                  onSave(selectedFile);
                  onClose();
                }
              }}
              className="w-full h-11 px-4 py-2.5 rounded-lg shadow-md border-none flex justify-center items-center gap-1.5 transition-all duration-300"
              style={{ 
                backgroundColor: colors['text-accent'],
                '--hover-bg': colors['text-accent-hover']
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors['text-accent-hover'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors['text-accent'];
              }}
            >
              <span className="text-white text-base font-semibold">Save</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
