'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';
import { checkWorkspaceName } from '@/app/utils/checkNames';

export default function WorkspaceSetup() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceURL, setWorkspaceURL] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showWorkspaceNameError, setShowWorkspaceNameError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const colors = useColors();

  // Prevent unnecessary re-renders with stable references
  const urlInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load saved workspace data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('workspaceSetupData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.workspaceName)
          setWorkspaceName(parsedData.workspaceName);
        if (parsedData.workspaceURL) setWorkspaceURL(parsedData.workspaceURL);
        if (parsedData.logo) setLogo(parsedData.logo);
      } catch (e) {
        console.warn('Error loading saved workspace data:', e);
      }
    }
  }, []);

  // Save workspace data when fields change
  useEffect(() => {
    if (workspaceName || workspaceURL || logo) {
      localStorage.setItem(
        'workspaceSetupData',
        JSON.stringify({
          workspaceName,
          workspaceURL,
          logo,
        })
      );
    }
  }, [workspaceName, workspaceURL, logo]);

  // Stable callback functions to prevent re-renders
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
      setter(e.target.value);
    },
    []
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setLogoFile(file);

        // Convert the file to a base64 string for proper storage and API transmission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setLogo(base64String);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setLogoFile(file);

      // Convert the file to a base64 string for proper storage and API transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Simplified URL change handler with stabilized functions
  const handleURLChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get value directly from the DOM element
      const value = e.target.value;
      setWorkspaceURL(value);

      // Check for invalid characters
      const hasInvalidChars = /[^a-zA-Z0-9-]/.test(value);

      if (hasInvalidChars && value !== '') {
        setUrlError('Only letters, numbers, and hyphens (-) are allowed');
      } else {
        setUrlError('');
        if (error === 'Please fix the URL format before continuing') {
          setError('');
        }
      }
    },
    [error]
  );

  // Stable focus/blur handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Only update URL from workspace name initially
  useEffect(() => {
    const sanitizedName = workspaceName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '');

    setWorkspaceURL(sanitizedName);
    setUrlError('');
  }, [workspaceName]);

  // Check if form is valid - stable reference
  const isFormValid = useCallback(() => {
    if (!workspaceName) return false;
    if (/[^a-zA-Z0-9-]/.test(workspaceURL)) return false;
    return true;
  }, [workspaceName, workspaceURL]);

  // Refactored submit handler to use direct DOM access where possible
  const handleSubmit = async () => {
    if (!workspaceName || !isFormValid()) {
      if (!workspaceName) {
        setError('Workspace name is required');
        setShowWorkspaceNameError(true);
      }
      if (urlError) {
        setError('Please fix the URL format before continuing');
      }
      return;
    }

    const nameError = checkWorkspaceName(workspaceName);
    if (nameError) {
      setError(nameError.title + ' : ' + nameError.description);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'WORKSPACE_SETUP',
          data: {
            workspace_name: workspaceName,
            workspace_url:
              workspaceURL ||
              workspaceName
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9-]/g, ''),
            workspace_icon_url: logo || null,
            onboarding_step: 'COMPLETED',
          },
        }),
      });

      if (response.ok) {
        // Clear all localStorage data when onboarding is complete
        localStorage.removeItem('personalInfoData');
        localStorage.removeItem('professionalInfoData');
        localStorage.removeItem('workspaceSetupData');

        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(
          data.error || 'An error occurred while creating your workspace'
        );
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      setError('A connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // Manual back button handler
  const handleBackClick = useCallback(async () => {
    setIsNavigatingBack(true);

    try {
      await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'WORKSPACE_SETUP',
          data: {
            onboarding_step: 'PROFESSIONAL_INFO',
            is_navigating_back: true,
            skip_workspace_creation: true,
          },
        }),
      }).catch((err) => {
        console.warn(
          'Error updating onboarding step, but continuing navigation:',
          err
        );
      });

      window.location.href = '/onboarding/professional-info';
    } catch (error) {
      console.warn(
        'Error during back navigation, but continuing to previous step:',
        error
      );
      window.location.href = '/onboarding/professional-info';
    } finally {
      setIsNavigatingBack(false);
    }
  }, []);

  // Browser back button handler
  useEffect(() => {
    const handlePopState = async (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);

      if (isNavigatingBack) return;
      setIsNavigatingBack(true);

      try {
        await fetch('/api/onboarding/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'WORKSPACE_SETUP',
            data: {
              onboarding_step: 'PROFESSIONAL_INFO',
              is_navigating_back: true,
              skip_workspace_creation: true,
            },
          }),
        }).catch((err) => {
          console.warn(
            'Error updating onboarding step, but continuing navigation:',
            err
          );
        });

        window.location.href = '/onboarding/professional-info';
      } catch (error) {
        console.warn(
          'Error during back navigation, but continuing to previous step:',
          error
        );
        window.location.href = '/onboarding/professional-info';
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isNavigatingBack]);

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center px-4 py-6"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
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
            <div
              className="self-stretch text-center text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed sm:leading-loose"
              style={{ color: colors['text-primary'] }}
            >
              Welcome to ProcessFlow!
            </div>
            <div
              className="self-stretch text-center text-sm sm:text-base font-normal font-['Inter'] leading-normal"
              style={{ color: colors['text-secondary'] }}
            >
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
            <InputField
              label="Workspace Name"
              required
              type="default"
              placeholder="Processflow"
              value={workspaceName}
              onChange={(value) => {
                handleInputChange(
                  { target: { value } } as React.ChangeEvent<HTMLInputElement>,
                  setWorkspaceName
                );
                if (error) setError('');
              }}
              disabled={isLoading}
              destructive={!!error && !workspaceName}
              errorMessage={
                error && !workspaceName ? 'Workspace name is required' : ''
              }
            />

            {/* Workspace URL Input - with validation */}
            <div className="w-full flex-col justify-start items-start gap-1.5 flex">
              <div
                className="text-sm font-medium font-['Inter'] leading-tight"
                style={{ color: colors['text-primary'] }}
              >
                Workspace URL
              </div>
              <div
                className={`w-full flex items-center rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border transition-all duration-200`}
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: urlError
                    ? 'rgb(239, 68, 68)'
                    : isFocused
                      ? colors['border-accent']
                      : colors['border-secondary'],
                  boxShadow: isFocused
                    ? `0 0 0 4px ${colors['ring-accent']}`
                    : undefined,
                }}
              >
                <div className="min-w-fit px-3 py-2 rounded-tl-lg rounded-bl-lg">
                  <span
                    className="text-base"
                    style={{ color: colors['text-secondary'] }}
                  >
                    app.process-flow.io/
                  </span>
                </div>
                <input
                  ref={urlInputRef}
                  type="text"
                  value={workspaceURL}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={handleURLChange}
                  placeholder={
                    workspaceName
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-zA-Z0-9-]/g, '') || 'processflow'
                  }
                  className={`flex-grow w-full px-3 py-2 rounded-tr-lg rounded-br-lg border-l focus:outline-none transition-colors duration-200`}
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderLeftColor: isFocused
                      ? colors['border-accent']
                      : colors['border-secondary'],
                    color: workspaceURL
                      ? colors['text-primary']
                      : colors['text-secondary'],
                  }}
                />
              </div>
              {urlError && (
                <div className="text-red-500 text-xs mt-1">{urlError}</div>
              )}
            </div>

            {/* Workspace Logo Upload - Made responsive */}
            <div className="self-stretch flex-col justify-start items-start gap-2 flex">
              <div
                className="w-40 text-sm font-medium font-['Inter'] leading-tight"
                style={{ color: colors['text-primary'] }}
              >
                Workspace Logo
              </div>
              <div className="self-stretch flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                {/* Upload Circle */}
                <label
                  htmlFor="logo-upload"
                  className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border cursor-pointer"
                  style={{
                    backgroundColor: colors['bg-secondary'],
                    borderColor: colors['border-secondary'],
                  }}
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
                  <div
                    className="w-full h-[74px] px-3 sm:px-6 py-3 sm:py-4 rounded-xl border hover:border-[#4E6BD7] transition-colors duration-300 flex flex-col justify-start items-center gap-1"
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor: colors['border-secondary'],
                    }}
                  >
                    <div className="w-full h-[42px] flex flex-col justify-center items-center gap-1 sm:gap-3">
                      <div className="w-full flex flex-col justify-center items-center">
                        <div className="w-full flex flex-wrap justify-center items-center gap-1 text-xs sm:text-sm">
                          <div className="flex justify-center items-center gap-1 overflow-hidden">
                            <div className="font-semibold font-['Inter'] leading-tight text-[#4761c4]">
                              Click to upload
                            </div>
                          </div>
                          <div
                            className="font-normal font-['Inter'] leading-tight"
                            style={{ color: colors['text-secondary'] }}
                          >
                            or drag and drop
                          </div>
                        </div>
                        <div
                          className="w-full text-center text-xs font-normal font-['Inter'] leading-[18px]"
                          style={{ color: colors['text-secondary'] }}
                        >
                          SVG, PNG, JPG or GIF (max. 800×400px)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons - Responsive */}
          <div className="h-10 flex justify-between items-start w-full mt-2 sm:mt-4">
            <ButtonNormal
              variant="secondary"
              size="small"
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
              onClick={handleBackClick}
              disabled={isNavigatingBack}
              className="text-sm sm:text-base"
            >
              Back
            </ButtonNormal>

            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid() || isNavigatingBack}
              trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
              className="text-sm sm:text-base"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
}
