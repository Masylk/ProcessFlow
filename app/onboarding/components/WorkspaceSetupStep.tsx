'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useOnboarding } from '../context/OnboardingContext';
import { checkWorkspaceName } from '@/app/utils/checkNames';
import {
  sanitizeWorkspaceNameInput,
  generateSlugFromName,
} from '../utils/inputSanitizer';

const WorkspaceSetupStep: React.FC = () => {
  const {
    workspaceInfo: {
      workspaceName,
      workspaceURL,
      logo,
      logoFile,
      setWorkspaceName,
      setWorkspaceURL,
      setLogo,
      setLogoFile,
    },
    isLoading,
    isNavigatingBack,
    error,
    setError,
    submitWorkspaceSetup,
    goToPreviousStep,
  } = useOnboarding();

  // UI states
  const [isFocused, setIsFocused] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [showWorkspaceNameError, setShowWorkspaceNameError] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  // References
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Constants for file upload
  const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];
  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  // Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug) {
      setSlugAvailability(null);
      return;
    }

    try {
      setIsCheckingSlug(true);
      const response = await fetch(
        `/api/workspace/check-slug?slug=${encodeURIComponent(slug)}`
      );
      const data = await response.json();

      setSlugAvailability({
        available: data.available,
        message: data.message,
      });
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setSlugAvailability(null);
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Clean up slug check timeout
  useEffect(() => {
    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, []);

  // Handle workspace name input change
  const handleWorkspaceNameChange = (value: string) => {
    const sanitized = sanitizeWorkspaceNameInput(value);
    setWorkspaceName(sanitized);

    // Generate the URL slug from the workspace name
    const slug = generateSlugFromName(sanitized);
    setWorkspaceURL(slug);

    // Clear any existing timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
    }

    // Set new timeout for slug check
    slugCheckTimeoutRef.current = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 500);
  };

  // Handle URL change
  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWorkspaceURL(value);

    // Check for invalid characters
    const hasInvalidChars = /[^a-zA-Z0-9-]/.test(value);

    if (hasInvalidChars && value !== '') {
      setUrlError('Only letters, numbers, and hyphens (-) are allowed');
      setSlugAvailability(null);
      setError('');
    } else {
      setUrlError('');

      // Clear any existing timeout
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }

      // Set new timeout for slug check
      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlugAvailability(value);
      }, 500);
    }
  };

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Type check
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(
          'Invalid file type. Please upload a PNG, JPG, GIF, or SVG image.'
        );
        return;
      }
      // Size check
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
        return;
      }

      setLogoFile(file);
      setError('');

      // Convert the file to a base64 string for proper storage and API transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Type check
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(
          'Invalid file type. Please upload a PNG, JPG, GIF, or SVG image.'
        );
        return;
      }
      // Size check
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
        return;
      }

      setLogoFile(file);
      setError('');

      // Convert the file to a base64 string for proper storage and API transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Focus/blur handlers
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Form validation
  const isFormValid = () => {
    if (!workspaceName) return false;
    // Only allow letters, numbers, spaces, and hyphens in workspace name
    if (/[^a-zA-Z0-9\- ]/.test(workspaceName)) return false;
    if (/[^a-zA-Z0-9-]/.test(workspaceURL)) return false;
    if (!slugAvailability || !slugAvailability.available) return false;
    return true;
  };

  // Handle submit workspace
  const handleSubmitWorkspace = () => {
    if (!workspaceName || !isFormValid()) {
      if (!workspaceName) {
        setError('Workspace name is required');
        setShowWorkspaceNameError(true);
      }
      // Show error for invalid workspace name
      if (/[^a-zA-Z0-9\- ]/.test(workspaceName)) {
        setError(
          'Workspace name can only contain letters, numbers, spaces, and hyphens'
        );
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

    // Submit to context
    submitWorkspaceSetup();
  };

  return (
    <div
      className="w-full max-w-[442px] flex flex-col gap-4 sm:gap-6 mx-auto mb-8"
      data-testid="workspace-setup-step"
    >
      <div className="self-stretch flex-col justify-start items-center gap-2 sm:gap-4 flex">
        <div className="self-stretch text-center text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed sm:leading-loose text-gray-900 dark:text-white">
          Set up your workspace
        </div>
        <div className="self-stretch text-center text-sm sm:text-base font-normal font-['Inter'] leading-normal text-gray-600 dark:text-gray-300">
          You will still be able to modify your workspace later.
        </div>
      </div>

      {/* Only show error if it's not related to slug availability */}
      {error && !error.includes('workspace URL') && (
        <div className="self-stretch text-center text-red-600 text-sm font-normal">
          {error}
        </div>
      )}

      <div className="w-full flex-col justify-start items-start gap-4 sm:gap-6 flex pt-4 sm:pt-6">
        {/* Workspace Name Input */}
        <InputField
          dataTestId="workspace-name-input"
          label="Workspace Name"
          required
          type="default"
          placeholder="Processflow"
          value={workspaceName}
          onChange={handleWorkspaceNameChange}
          disabled={isLoading}
          destructive={!!error && !workspaceName}
          errorMessage={
            error && !workspaceName ? 'Workspace name is required' : ''
          }
        />

        {/* Workspace URL Input */}
        <div className="w-full flex-col justify-start items-start gap-1.5 flex">
          <div className="text-sm font-medium font-['Inter'] leading-tight text-gray-900 dark:text-white">
            Workspace URL
          </div>
          <div className="w-full flex items-center rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border transition-all duration-200 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
            <div className="min-w-fit px-3 py-2 rounded-tl-lg rounded-bl-lg">
              <span className="text-gray-600 dark:text-gray-300">
                app.process-flow.io/
              </span>
            </div>
            <input
              type="text"
              disabled
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
              className="flex-grow w-full px-3 py-2 rounded-tr-lg rounded-br-lg border-l focus:outline-none transition-colors duration-200 bg-white dark:bg-gray-900 border-l-gray-300 dark:border-l-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {urlError && (
            <div className="text-red-500 text-xs mt-1">{urlError}</div>
          )}
          {!urlError && (
            <div
              className={`text-xs mt-1 ${
                isCheckingSlug
                  ? 'text-gray-500'
                  : slugAvailability
                    ? slugAvailability.available
                      ? 'text-green-600'
                      : 'text-red-500'
                    : ''
              }`}
            >
              {isCheckingSlug
                ? 'Checking availability...'
                : slugAvailability
                  ? slugAvailability.message
                  : ''}
            </div>
          )}
        </div>

        {/* Workspace Logo Upload */}
        <div className="self-stretch flex-col justify-start items-start gap-2 flex">
          <div className="w-40 text-sm font-medium font-['Inter'] leading-tight text-gray-900 dark:text-white">
            Workspace Logo
          </div>
          <div className="self-stretch flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            {/* Upload Circle */}
            <label
              htmlFor="logo-upload"
              className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border cursor-pointer bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
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
              <div className="w-full h-[74px] px-3 sm:px-6 py-3 sm:py-4 rounded-xl border hover:border-[#4E6BD7] transition-colors duration-300 flex flex-col justify-start items-center gap-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                <div className="w-full h-[42px] flex flex-col justify-center items-center gap-1 sm:gap-3">
                  <div className="w-full flex flex-col justify-center items-center">
                    <div className="w-full flex flex-wrap justify-center items-center gap-1 text-xs sm:text-sm">
                      <div className="flex justify-center items-center gap-1 overflow-hidden">
                        <div className="font-semibold font-['Inter'] leading-tight text-[#4761c4]">
                          Click to upload
                        </div>
                      </div>
                      <div className="font-normal font-['Inter'] leading-tight text-gray-600 dark:text-gray-300">
                        or drag and drop
                      </div>
                    </div>
                    <div className="w-full text-center text-xs font-normal font-['Inter'] leading-[18px] text-gray-600 dark:text-gray-300">
                      SVG, PNG, JPG or GIF (max. 800×400px)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="h-10 flex flex-row justify-between items-start w-full mt-4 sm:mt-6 gap-4">
        <ButtonNormal
          variant="secondary"
          size="small"
          onClick={goToPreviousStep}
          className="w-1/3"
        >
          Back
        </ButtonNormal>

        <ButtonNormal
          variant="primary"
          size="small"
          onClick={handleSubmitWorkspace}
          disabled={
            isLoading || !isFormValid() || isNavigatingBack || isCheckingSlug
          }
          className="w-2/3"
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </ButtonNormal>
      </div>
    </div>
  );
};

export default WorkspaceSetupStep;
