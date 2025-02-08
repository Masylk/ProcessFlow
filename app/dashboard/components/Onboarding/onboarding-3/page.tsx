'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceURL, setWorkspaceURL] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setWorkspaceURL(workspaceName.toLowerCase().replace(/\s+/g, '-'));
  }, [workspaceName]);

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      <div className="w-full h-screen flex-col justify-center items-center gap-[72px] inline-flex">
        <div className="w-[159px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className=""
            />
          </div>
        </div>

        <div className="relative flex items-center w-64">
          {/* First Step - Validated */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />

          {/* Progress Bar */}
          <div className="flex-grow h-0.5 bg-[#4761c4] mx-2"></div>

          {/* Second Step - Validated */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />

          {/* Progress Bar */}
          <div className="flex-grow h-0.5 bg-[#4761c4] mx-2"></div>

          {/* Third Step - Current Step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-[#edf0fb] rounded-full border-2 border-[#4761c4]">
            <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>

        <div className="h-[442px] flex-col justify-start items-start gap-6 inline-flex">
          <div className="self-stretch h-[72px] flex-col justify-start items-center gap-4 flex">
            <div className="self-stretch text-center text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
              Welcome to ProcessFlow!
            </div>
            <div className="self-stretch text-center text-[#101828] text-base font-normal font-['Inter'] leading-normal">
              You will still be able to modify your workspace later.
            </div>
          </div>

          <div className="w-full flex-col justify-start items-start gap-6 flex pt-6">
            {/* Workspace Name Input */}
            <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Workspace Name
              </div>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => handleInputChange(e, setWorkspaceName)}
                placeholder="Processflow"
                className={`self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                  workspaceName ? 'text-[#101828]' : 'text-[#667085]'
                } border-[#d0d5dd] focus:border-[#4E6BD7] focus:outline-none`}
              />
            </div>

            {/* Workspace Logo Upload */}
            <div className="self-stretch flex-col justify-start items-start gap-2 flex">
              <div className="w-40 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Workspace Logo
              </div>
              <div className="self-stretch flex items-center gap-5">
                {/* Upload Circle */}
                <label
                  htmlFor="logo-upload"
                  className="w-16 h-16 flex items-center justify-center bg-[#f2f4f7] rounded-full border border-[#d0d5dd] cursor-pointer"
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt="Workspace Logo"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/image-plus.svg`}
                      alt="Add Workspace Logo"
                      className="w-8 h-8"
                    />
                  )}
                </label>
                <input
                  ref={fileInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                <div
                  className="flex-grow flex-col justify-start items-start gap-4 cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleFileInputClick}
                >
                  <div className="w-full h-[74px] px-6 py-4 bg-white rounded-xl border border-[#e4e7ec] hover:border-[#4E6BD7] transition-colors duration-300 flex flex-col justify-start items-center gap-1">
                    <div className="w-full h-[42px] flex flex-col justify-center items-center gap-3">
                      <div className="w-full h-[42px] flex flex-col justify-center items-center gap-1">
                        <div className="w-full flex justify-center items-start gap-1">
                          <div className="flex justify-center items-center gap-1.5 overflow-hidden">
                            <div className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                              Click to upload
                            </div>
                          </div>
                          <div className="text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                            or drag and drop
                          </div>
                        </div>
                        <div className="w-full text-center text-[#475467] text-xs font-normal font-['Inter'] leading-[18px]">
                          SVG, PNG, JPG or GIF (max. 800×400px)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace URL Input */}
            <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Workspace URL
              </div>
              <div
                className={`flex items-center bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                  isFocused ? 'border-[#4E6BD7]' : 'border-[#d0d5dd]'
                }`}
              >
                <div className="px-3 py-2 rounded-tl-lg rounded-bl-lg">
                  <span className="text-[#475467] text-base">
                    app.process-flow.io/
                  </span>
                </div>
                <input
                  type="text"
                  value={workspaceURL}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => handleInputChange(e, setWorkspaceURL)}
                  placeholder={
                    workspaceName.toLowerCase().replace(/\s+/g, '-') ||
                    'processflow'
                  }
                  className={`flex-grow px-3 py-2 bg-white rounded-tr-lg rounded-br-lg border-l focus:outline-none ${
                    workspaceURL ? 'text-[#101828]' : 'text-[#667085]'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="h-10 flex justify-between items-start w-full">
            {/* Back Button */}
            <div className="px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden transition-all duration-300 hover:bg-[#F9FAFB] cursor-pointer">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                alt="Arrow left icon"
                className="w-5 h-5"
              />
              <div className="px-0.5 justify-center items-center flex">
                <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  Back
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="px-3.5 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border-2 border-white justify-center items-center gap-1 flex overflow-hidden transition-all duration-300 hover:bg-[#374C99] cursor-pointer">
              <div className="px-0.5 justify-center items-center flex">
                <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
                  Continue
                </div>
              </div>
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
                alt="White arrow right icon"
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
