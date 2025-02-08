import { useState, useRef } from 'react';

interface UploadImageModalProps {
  onClose: () => void;
  onSave: (file: File) => void;
}

export default function UploadImageModal({
  onClose,
  onSave,
}: UploadImageModalProps) {
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
    <main className=" fixed inset-0 flex items-center justify-center z-50 w-full">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-[#0c111d] opacity-70 backdrop-blur-lg z-40"></div>

      {/* Modal */}
      <div className="relative w-[480px] bg-white rounded-xl shadow-lg flex flex-col justify-start items-center overflow-hidden z-50">
        <div className="w-full h-40 flex flex-col justify-start items-center">
          <div className="w-full h-[140px] px-6 pt-6 flex flex-col justify-start items-start gap-4">
            {/* Image Icon */}
            <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/image-03.svg`}
                alt="Image Icon"
                className="w-6 h-6"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <h2 className="text-[#101828] text-lg font-semibold">
                {selectedFile
                  ? 'Selected File'
                  : 'Drop an image here or click to upload'}
              </h2>
              <p className="text-[#475467] text-sm font-normal">
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
              className="w-full h-[126px] px-6 py-4 bg-white rounded-xl border-2 border-[#e4e7ec] flex flex-col justify-start items-center gap-1 group transition-all duration-300 hover:border-[#4e6bd7] cursor-pointer"
              onClick={handleUploadAreaClick}
            >
              <div className="w-full h-[94px] flex flex-col justify-start items-center gap-3">
                {/* Upload Icon */}
                <div className="w-10 h-10 p-2.5 bg-white rounded-lg shadow border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-cloud-02.svg`}
                    alt="Upload Cloud"
                    className="w-5 h-5"
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-center gap-1">
                  <div className="flex justify-center items-start gap-1">
                    <span className="text-[#374c99] text-sm font-semibold cursor-pointer transition-all duration-300 hover:text-[#2B3B76]">
                      Click to upload
                    </span>
                    <span className="text-[#475467] text-sm font-normal">
                      or drag and drop
                    </span>
                  </div>
                  <p className="text-center text-[#475467] text-xs font-normal">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Selected File Display
            <div className="h-[72px] w-full p-4 bg-white rounded-xl border border-[#e4e7ec] justify-start items-start gap-1 inline-flex">
              <div className="grow shrink basis-0 h-10 justify-start items-start gap-3 flex">
                <div className="w-10 h-10 relative">
                  {/* <div className="w-8 h-10 left-[7px] top-0 absolute">  */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/page-icon.svg`}
                    alt="Delete Icon"
                    className="w-8 h-10 left-[5px] top-[0px] absolute"
                  />
                  {/* </div> */}
                  <div className="px-[3px] py-0.5 left-[1px] top-[15px] absolute bg-[#4761c4] rounded-sm justify-start items-start gap-2 inline-flex">
                    <div className="text-center text-white text-[10px] font-bold font-['Inter']">
                      IMG
                    </div>
                  </div>
                </div>
                <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                  <div className="self-stretch h-10 flex-col justify-start items-start flex">
                    <div className="self-stretch text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                      {selectedFile.name}
                    </div>
                    <div className="self-stretch pt-1 text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-0 rounded-lg gap-2 overflow-hidden">
                <button
                  onClick={handleRemoveFile}
                  className="w-5 h-5 text-[#4E6BD7] hover:text-[#3B55B5] transition-all duration-300"
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
              className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#F9FAFB]"
            >
              <span className="text-[#344054] text-base font-semibold">
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
              className="w-full h-11 px-4 py-2.5 bg-[#4E6BD7] bg-opacity-100 rounded-lg shadow-md border-none flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#3B55B5]"
            >
              <span className="text-white text-base font-semibold">Save</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
