"use client"

import { useState, useEffect, useRef } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function WorkspaceSetup() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceURL, setWorkspaceURL] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
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
      setLogoFile(file);
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Mettre à jour l'URL automatiquement basée sur le nom
  useEffect(() => {
    setWorkspaceURL(workspaceName.toLowerCase().replace(/\s+/g, '-'));
  }, [workspaceName]);

  const handleSubmit = async () => {
    if (!workspaceName) {
      setError("Workspace name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Préparer les données à envoyer
      const formData = new FormData();
      formData.append('step', 'WORKSPACE_SETUP');
      
      // Ajouter le logo si présent
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Ajouter les autres données
      formData.append('data', JSON.stringify({
            workspace_name: workspaceName,
            workspace_url: workspaceURL,
            onboarding_step: 'COMPLETED'
      }));

      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update workspace");
      }

      // Redirect to the completed page instead of dashboard
      router.push('/onboarding/completed');
    } catch (error) {
      console.error('Error updating workspace setup:', error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-[1280px] flex-col justify-center items-center gap-8 sm:gap-12 md:gap-[72px] inline-flex">
        {/* Logo Section - Responsive */}
        <div className="w-[180px] sm:w-[200px] md:w-[240px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className="w-full"
            />
          </div>
        </div>

        {/* Progress indicator - Hide on very small screens */}
        <div className="hidden sm:flex relative items-center w-64">
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

        {/* Form container - Responsive */}
        <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[442px] flex-col justify-start items-start gap-4 sm:gap-6 inline-flex">
          <div className="self-stretch flex-col justify-start items-center gap-2 sm:gap-4 flex">
            <div className="self-stretch text-center text-[#101828] text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed sm:leading-loose">
              Welcome to ProcessFlow!
            </div>
            <div className="self-stretch text-center text-[#101828] text-sm sm:text-base font-normal font-['Inter'] leading-normal">
              You will still be able to modify your workspace later.
            </div>
          </div>

          {error && (
            <div className="self-stretch text-center text-red-600 text-sm font-normal">
              {error}
            </div>
          )}

          <div className="w-full flex-col justify-start items-start gap-4 sm:gap-6 flex pt-4 sm:pt-6">
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

            {/* Workspace Logo Upload - Made responsive */}
            <div className="self-stretch flex-col justify-start items-start gap-2 flex">
              <div className="w-40 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Workspace Logo
              </div>
              <div className="self-stretch flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                {/* Upload Circle */}
                <label
                  htmlFor="logo-upload"
                  className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-[#f2f4f7] rounded-full border border-[#d0d5dd] cursor-pointer"
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
                  className="w-full flex-grow flex-col justify-start items-start gap-4 cursor-pointer mt-2 sm:mt-0"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleFileInputClick}
                >
                  <div className="w-full h-[74px] px-3 sm:px-6 py-3 sm:py-4 bg-white rounded-xl border border-[#e4e7ec] hover:border-[#4E6BD7] transition-colors duration-300 flex flex-col justify-start items-center gap-1">
                    <div className="w-full h-[42px] flex flex-col justify-center items-center gap-1 sm:gap-3">
                      <div className="w-full flex flex-col justify-center items-center">
                        <div className="w-full flex flex-wrap justify-center items-center gap-1 text-xs sm:text-sm">
                          <div className="flex justify-center items-center gap-1 overflow-hidden">
                            <div className="text-[#374c99] font-semibold font-['Inter'] leading-tight">
                              Click to upload
                            </div>
                          </div>
                          <div className="text-[#475467] font-normal font-['Inter'] leading-tight">
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

            {/* Workspace URL Input - Preserved sizing as requested */}
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

          {/* Buttons - Responsive */}
          <div className="h-10 flex justify-between items-start w-full mt-2 sm:mt-4">
            <ButtonNormal
              variant="secondary"
              size="small"
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
              onClick={() => router.push('/onboarding/professional-info')}
              className="text-sm sm:text-base"
            >
              Back
            </ButtonNormal>

            <ButtonNormal
              variant="primary"
              size="small"
              trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
              onClick={handleSubmit}
              disabled={isLoading || !workspaceName}
              className="text-sm sm:text-base"
            >
              {isLoading ? "Loading..." : "Continue"}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
} 