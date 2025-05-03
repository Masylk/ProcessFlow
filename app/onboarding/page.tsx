'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useColors, useTheme } from '@/app/theme/hooks';
import { AnimatePresence } from 'framer-motion';
import MotionStep from './components/MotionStep';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { checkWorkspaceName } from '@/app/utils/checkNames';
import { themeRegistry } from '@/app/theme/registry';

export type OnboardingStep = 'PERSONAL_INFO' | 'PROFESSIONAL_INFO' | 'WORKSPACE_SETUP' | 'COMPLETED';

// Utility function for sanitizing name input
function sanitizeNameInput(value: string): string {
  // Only remove whitespace from the beginning and end, not within the string
  let sanitized = value.trim();
  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');
  // Allow only letters, spaces, hyphens, and apostrophes
  sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ'\- ]/g, '');
  return sanitized;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('PERSONAL_INFO');
  // Use light theme colors regardless of system theme
  const colors = themeRegistry.get('light').tokens.colors;
  const router = useRouter();
  
  // Add flag to track if workspace creation has been initiated
  const [workspaceCreationStarted, setWorkspaceCreationStarted] = useState(false);
  
  // Add effect to ensure page is scrollable and uses light mode
  useEffect(() => {
    // Ensure the body has proper overflow behavior
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    
    // Force light theme styles for onboarding
    document.documentElement.classList.add('force-light-theme');
    
    return () => {
      // Reset on unmount
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.classList.remove('force-light-theme');
    };
  }, []);
  
  // Check for step parameter in URL - this needs to run before the workspace creation check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const stepParam = url.searchParams.get('step') as OnboardingStep | null;
      
      // Check if we're being redirected from a workspace deletion
      const fromDeletion = url.searchParams.get('from') === 'workspace_deletion';
      
      // If we're coming from a workspace deletion, we should not be marked as having started workspace creation
      if (fromDeletion) {
        localStorage.removeItem('workspaceCreationStarted');
        setWorkspaceCreationStarted(false);
      }
      
      // Only accept valid step values
      if (stepParam && ['PERSONAL_INFO', 'PROFESSIONAL_INFO', 'WORKSPACE_SETUP', 'COMPLETED'].includes(stepParam)) {
        // Don't allow going directly to completed step unless workspace creation was already started
        if (stepParam === 'COMPLETED' && !localStorage.getItem('workspaceCreationStarted')) return;
        
        // Set current step from URL parameter
        setCurrentStep(stepParam);
      }
    }
  }, []);
  
  // Check if workspace creation already started and redirect if necessary
  useEffect(() => {
    // Only check for workspace creation if we're not explicitly set to WORKSPACE_SETUP
    if (currentStep !== 'WORKSPACE_SETUP') {
      const creationStarted = localStorage.getItem('workspaceCreationStarted') === 'true';
      if (creationStarted) {
        setWorkspaceCreationStarted(true);
        // If navigating back to a previous step after workspace creation started,
        // ensure user stays on the COMPLETED step
        if (currentStep !== 'COMPLETED') {
          setCurrentStep('COMPLETED');
        }
      }
    }
  }, [currentStep]);
  
  // Personal Info state
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  
  // Professional Info state
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [source, setSource] = useState('');
  
  // Workspace setup state - move these to component level
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceURL, setWorkspaceURL] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [showWorkspaceNameError, setShowWorkspaceNameError] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  
  // Completed step state
  const [isWorkflowCreated, setIsWorkflowCreated] = useState(false);
  const [workflowCreationError, setWorkflowCreationError] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  
  // Refs
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLIFrameElement | null>(null);
  
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
  
  // Sanitize workspace name input
  function sanitizeWorkspaceNameInput(value: string): string {
    // Only remove whitespace from the beginning and end, not within the string
    let sanitized = value.trim();
    // Remove any HTML tags
    sanitized = sanitized.replace(/<[^>]*>?/gm, '');
    // Allow letters, numbers, spaces, hyphens, and apostrophes
    sanitized = sanitized.replace(/[^a-zA-Z0-9À-ÿ'\- ]/g, '');
    // Limit to 50 characters
    sanitized = sanitized.slice(0, 50);
    return sanitized;
  }

  // Load saved data for current step
  useEffect(() => {
    // Load personal info
    if (currentStep === 'PERSONAL_INFO') {
      const savedData = localStorage.getItem('personalInfoData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFirstName(parsedData.firstName || '');
          setLastName(parsedData.lastName || '');
        } catch (e) {
          console.warn('Error loading saved personal info data:', e);
        }
      }
    }
    
    // Load professional info
    if (currentStep === 'PROFESSIONAL_INFO') {
      const savedData = localStorage.getItem('professionalInfoData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setIndustry(parsedData.industry || '');
          setRole(parsedData.role || '');
          setCompanySize(parsedData.companySize || '');
          setSource(parsedData.source || '');
        } catch (e) {
          console.warn('Error loading saved form data:', e);
        }
      }
    }
    
    // Load workspace setup data
    if (currentStep === 'WORKSPACE_SETUP') {
      const savedData = localStorage.getItem('workspaceSetupData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.workspaceName) {
            setWorkspaceName(parsedData.workspaceName);
            // Check availability for the loaded workspace URL
            const slug =
              parsedData.workspaceURL ||
              parsedData.workspaceName
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '');
            checkSlugAvailability(slug);
          }
          if (parsedData.workspaceURL) setWorkspaceURL(parsedData.workspaceURL);
          if (parsedData.logo) setLogo(parsedData.logo);
        } catch (e) {
          console.warn('Error loading saved workspace data:', e);
        }
      }
    }
    
    // Start creating workspace and workflow when user reaches the completed step
    if (currentStep === 'COMPLETED') {
      createWorkspace();
      // Set flag that workspace creation has started
      if (!workspaceCreationStarted) {
        setWorkspaceCreationStarted(true);
      }
    }
  }, [currentStep, checkSlugAvailability, workspaceCreationStarted]);
  
  // Save form data when it changes
  useEffect(() => {
    if (currentStep === 'PERSONAL_INFO' && (firstName || lastName)) {
      localStorage.setItem(
        'personalInfoData',
        JSON.stringify({
          firstName,
          lastName,
        })
      );
    }
    
    if (currentStep === 'PROFESSIONAL_INFO' && (industry || role || companySize || source)) {
      localStorage.setItem('professionalInfoData', JSON.stringify({
        industry,
        role,
        companySize,
        source
      }));
    }
    
    if (currentStep === 'WORKSPACE_SETUP' && (workspaceName || workspaceURL || logo)) {
      localStorage.setItem(
        'workspaceSetupData',
        JSON.stringify({
          workspaceName,
          workspaceURL,
          logo,
        })
      );
    }
  }, [firstName, lastName, industry, role, companySize, source, workspaceName, workspaceURL, logo, currentStep]);
  
  // Clean up slug check timeout
  useEffect(() => {
    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle input changes for personal info
  const handleLastNameChange = (value: string) => {
    // Allow spaces and only sanitize other characters
    if (value.length <= 40) {
      // Only remove non-allowed characters (keep letters, spaces, hyphens and apostrophes)
      const sanitized = value.replace(/[^a-zA-ZÀ-ÿ'\- ]/g, '');
      setLastName(sanitized);
    }
  };

  const handleFirstNameChange = (value: string) => {
    // Allow spaces and only sanitize other characters
    if (value.length <= 40) {
      // Only remove non-allowed characters (keep letters, spaces, hyphens and apostrophes)
      const sanitized = value.replace(/[^a-zA-ZÀ-ÿ'\- ]/g, '');
      setFirstName(sanitized);
    }
  };
  
  // Handle workspace name input change
  const handleWorkspaceNameChange = (value: string) => {
    const sanitized = sanitizeWorkspaceNameInput(value);
    setWorkspaceName(sanitized);
    
    // Generate the URL slug from the workspace name
    const slug = sanitized
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '');

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
        setError('File is too large. Maximum size is 1MB.');
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
        setError('File is too large. Maximum size is 1MB.');
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
    if (/[^a-zA-Z0-9-]/.test(workspaceURL)) return false;
    if (slugAvailability && !slugAvailability.available) return false;
    return true;
  };
  
  // Handle submit from workspace setup step - now it just validates and transitions to completed step
  const handleSubmitWorkspace = () => {
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

    // Just transition to completed step without creating workspace yet
    setCurrentStep('COMPLETED');
  };

  // New function to handle workspace creation with retry logic for slug conflicts
  const createWorkspace = async () => {
    setIsLoading(true);
    setError('');
    setIsCreatingWorkflow(true);
    
    // Mark that workspace creation has started - prevents going back to previous steps
    setWorkspaceCreationStarted(true);
    // Also store in localStorage for persistence
    localStorage.setItem('workspaceCreationStarted', 'true');

    // Get the initial slug
    let currentSlug = workspaceURL ||
      workspaceName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '');
    
    // Maximum number of retries for slug conflicts
    const MAX_RETRIES = 5;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount <= MAX_RETRIES) {
      try {
        // Attempt to create the workspace with the current slug
        const response = await fetch('/api/onboarding/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'WORKSPACE_SETUP',
            data: {
              workspace_name: workspaceName,
              workspace_url: currentSlug,
              workspace_icon_url: logo || null,
              onboarding_step: 'COMPLETED',
            },
          }),
        });

        if (response.ok) {
          // Workspace creation succeeded
          success = true;
          // After workspace creation succeeds, create the default workflow
          await initializeDefaultWorkflow();
        } else {
          const data = await response.json();
          
          // Check if this is a slug constraint error
          if (data.error && data.error.includes('constraint failed') && data.error.includes('slug')) {
            // Increment retry counter
            retryCount++;
            
            if (retryCount <= MAX_RETRIES) {
              // Generate a new slug with a suffix
              currentSlug = `${workspaceURL || workspaceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${retryCount}`;
              
              // Silent retry - don't show error to user yet
              console.log(`Retrying workspace creation with modified slug: ${currentSlug}`);
            } else {
              // Max retries reached
              setError(`Unable to create workspace with the name "${workspaceName}". Please try a different name.`);
              setIsWorkflowCreated(false);
            }
          } else {
            // Not a slug error or unable to handle automatically
            setError(data.error || 'An error occurred while creating your workspace');
            setIsWorkflowCreated(false);
            break; // Exit the retry loop for non-slug errors
          }
        }
      } catch (error) {
        console.error('Error creating workspace:', error);
        setError('A connection error occurred. Please try again.');
        setIsWorkflowCreated(false);
        break; // Exit the retry loop on exception
      }
    }

    setIsLoading(false);
    setIsCreatingWorkflow(false);
  };

  // Initialize the default workflow
  const initializeDefaultWorkflow = async () => {
    try {
      const response = await fetch('/api/onboarding/create-default-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setIsWorkflowCreated(true);
      } else {
        const data = await response.json();
        setWorkflowCreationError(data.error || 'Failed to create default workflow');
        // Still set as created so user can continue
        setIsWorkflowCreated(true);
      }
    } catch (error) {
      console.error('Error creating default workflow:', error);
      setWorkflowCreationError('Connection error while creating default workflow');
      // Still set as created so user can continue
      setIsWorkflowCreated(true);
    }
  };

  // Handle completed step continue button
  const handleCompletedContinue = () => {
    // Clear all onboarding data when onboarding is complete
    // Note: We keep 'workspaceCreationStarted' flag to prevent returning to onboarding
    localStorage.removeItem('personalInfoData');
    localStorage.removeItem('professionalInfoData');
    localStorage.removeItem('workspaceSetupData');
    
    // Force navigation to dashboard even if there were errors
    router.push('/dashboard');
  };

  // Professional info options
  const dropdownOptions = {
    industry: ['IT', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'],
    role: ['Founder', 'Manager', 'Product Manager', 'Analyst', 'Designer', 'Sales', 'Marketing', 'HR', 'Customer Success', 'Freelancer', 'Other'],
    companySize: ['1', '2-9', '10-49', '50-199', '200-499', '500+'],
    source: ['ProductHunt', 'LinkedIn', 'Google', 'Friend', 'Other'],
  };
  
  // Submit handlers for each step
  const handlePersonalInfoSubmit = async () => {
    if (!firstName || !lastName) {
      return; // Validation simple
    }

    // First update the UI state to provide immediate feedback
    setCurrentStep('PROFESSIONAL_INFO');
    
    // Then make the API call in the background
    setIsLoading(true);
    try {
      await fetch('/api/onboarding/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PERSONAL_INFO',
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            onboarding_step: 'PROFESSIONAL_INFO',
          },
        }),
      });
    } catch (error) {
      console.error('Error updating personal info:', error);
      // Don't reset the step on error - just log it
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfessionalInfoSubmit = async () => {
    if (!industry || !role || !companySize || !source) {
      setError("Please fill in all fields");
      return;
    }

    // First update the UI state to provide immediate feedback
    setCurrentStep('WORKSPACE_SETUP');
    setError("");

    // Then make the API call in the background
    setIsLoading(true);
    try {
      await fetch('/api/onboarding/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PROFESSIONAL_INFO',
          data: {
            industry,
            professional_role: role,
            company_size: companySize,
            source,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        })
      });
    } catch (error) {
      console.error('Client error:', error instanceof Error ? error.message : 'Unknown error');
      // Don't show error message or reset the step if API fails
    } finally {
      setIsLoading(false);
    }
  };
  
  // Back button handlers - same approach, update UI first then make API call
  const handleBackToProfessionalInfo = async () => {
    // If workspace creation has started, don't allow navigation back
    if (workspaceCreationStarted) {
      // Keep user on the COMPLETED step
      setCurrentStep('COMPLETED');
      return;
    }
    
    setCurrentStep('PROFESSIONAL_INFO');
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
    } catch (error) {
      console.warn(
        'Error during back navigation, but continuing to previous step:',
        error
      );
    } finally {
      setIsNavigatingBack(false);
    }
  };
  
  const handleBackToPersonalInfo = async () => {
    // If workspace creation has started, don't allow navigation back
    if (workspaceCreationStarted) {
      // Keep user on the COMPLETED step
      setCurrentStep('COMPLETED');
      return;
    }
    
    setCurrentStep('PERSONAL_INFO');
    setIsNavigatingBack(true);
    
    try {
      await fetch('/api/onboarding/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PROFESSIONAL_INFO',
          data: {
            onboarding_step: 'PERSONAL_INFO',
            is_navigating_back: true
          }
        })
      }).catch(err => {
        console.warn('Error updating onboarding step, but continuing navigation:', err);
      });
    } catch (error) {
      console.warn('Error during back navigation, but continuing to previous step:', error);
    } finally {
      setIsNavigatingBack(false);
    }
  };

  // Render personal info step
  const renderPersonalInfoStep = () => {
    return (
      <div className="w-full max-w-[442px] flex flex-col gap-6 mx-auto">
        <div
          className="text-center text-2xl font-semibold font-['Inter']"
          style={{ color: colors['text-primary'] }}
        >
          Welcome to ProcessFlow!
        </div>
        <div
          className="text-center text-base font-normal font-['Inter']"
          style={{ color: colors['text-secondary'] }}
        >
          You can always change your name later.
        </div>
        <div className="pt-6 flex-col gap-6 flex">
          <InputField
            label="Last Name"
            placeholder="Jobs"
            value={lastName}
            onChange={handleLastNameChange}
            type="default"
            size="medium"
          />
          <InputField
            label="First Name"
            placeholder="Steve"
            value={firstName}
            onChange={handleFirstNameChange}
            type="default"
            size="medium"
          />
          <div className="mt-4">
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handlePersonalInfoSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </ButtonNormal>
          </div>
        </div>
      </div>
    );
  };

  // Render professional info step
  const renderProfessionalInfoStep = () => {
    return (
      <div className="w-full max-w-[442px] flex flex-col gap-4 sm:gap-6 mb-8 mx-auto">
        <div 
          className="self-stretch text-center text-xl md:text-2xl font-semibold font-['Inter'] leading-loose"
          style={{ color: colors['text-primary'] }}
        >
          Welcome to ProcessFlow!
        </div>
        <div 
          className="self-stretch text-center text-sm md:text-base font-normal font-['Inter'] leading-normal"
          style={{ color: colors['text-secondary'] }}
        >
          You will still be able to modify your workspace later.
        </div>
        
        {error && (
          <div className="self-stretch text-center text-red-600 text-sm font-normal">
            {error}
          </div>
        )}
        
        <div className="w-full flex flex-col md:flex-row pt-4 md:pt-6 justify-start items-start md:items-center gap-4 md:gap-2">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
            <div 
              className="whitespace-nowrap text-base font-normal leading-normal"
              style={{ color: colors['text-primary'] }}
            >
              I work in
            </div>
            <div className="w-full relative">
              <select
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select industry</option>
                {dropdownOptions.industry.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
                <svg
                  className="w-5 h-5"
                  style={{ color: colors['text-secondary'] }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
            <div 
              className="whitespace-nowrap text-base font-normal leading-normal"
              style={{ color: colors['text-primary'] }}
            >
              as a
            </div>
            <div className="w-full relative">
              <select
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select role</option>
                {dropdownOptions.role.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
                <svg
                  className="w-5 h-5"
                  style={{ color: colors['text-secondary'] }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-2 w-full">
          <div 
            className="whitespace-nowrap text-base font-normal leading-normal"
            style={{ color: colors['text-primary'] }}
          >
            for a company of
          </div>
          <div className="w-full relative">
            <select
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
                color: colors['text-primary'],
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option value="">Select company size</option>
              {dropdownOptions.companySize.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
              <svg
                className="w-5 h-5"
                style={{ color: colors['text-secondary'] }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-2 w-full">
          <div 
            className="whitespace-nowrap text-base font-normal leading-normal"
            style={{ color: colors['text-primary'] }}
          >
            I learned about ProcessFlow from
          </div>
          <div className="w-full relative">
            <select
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
                color: colors['text-primary'],
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Select source</option>
              {dropdownOptions.source.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-10">
              <svg
                className="w-5 h-5"
                style={{ color: colors['text-secondary'] }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="h-10 flex justify-between items-start w-full mt-2 md:mt-4">
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={handleProfessionalInfoSubmit}
            disabled={isLoading || !industry || !role || !companySize || !source}
            className="w-full"
          >
            Continue
          </ButtonNormal>
        </div>
      </div>
    );
  };

  // For workspace setup step, let's implement the actual workspace setup form
  const renderWorkspaceSetupStep = () => {
    // Render the workspace setup form - NO STATE DECLARATIONS IN HERE
    return (
      <div className="w-full max-w-[442px] flex flex-col gap-4 sm:gap-6 mx-auto mb-8">
        <div className="self-stretch flex-col justify-start items-center gap-2 sm:gap-4 flex">
          <div
            className="self-stretch text-center text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed sm:leading-loose"
            style={{ color: colors['text-primary'] }}
          >
            Set up your workspace
          </div>
          <div
            className="self-stretch text-center text-sm sm:text-base font-normal font-['Inter'] leading-normal"
            style={{ color: colors['text-secondary'] }}
          >
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
                borderColor:
                  urlError ||
                  (slugAvailability && !slugAvailability.available)
                    ? 'rgb(239, 68, 68)'
                    : slugAvailability && slugAvailability.available
                      ? 'rgb(34, 197, 94)'
                      : isFocused
                        ? colors['border-accent']
                        : colors['border-secondary'],
                boxShadow: isFocused
                  ? `0 0 0 4px ${colors['ring-accent']}`
                  : undefined,
              }}
            >
              <div className="min-w-fit px-3 py-2 rounded-tl-lg rounded-bl-lg">
                <span style={{ color: colors['text-secondary'] }}>
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

        {/* Buttons */}
        <div className="h-10 flex justify-between items-start w-full mt-4 sm:mt-6">
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={handleSubmitWorkspace}
            disabled={isLoading || !isFormValid() || isNavigatingBack}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </ButtonNormal>
        </div>
      </div>
    );
  };

  // Add a manual logout function that will clear all authentication data
  const handleEmergencyLogout = () => {
    // Clear all storage data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any auth cookies by setting them to expired
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    
    // Force reload to the root page
    window.location.href = '/';
  };

  // Render the completed step
  const renderCompletedStep = () => {
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 mx-auto">
        <div
          className="text-center text-2xl font-semibold font-['Inter']"
          style={{ color: colors['text-primary'] }}
        >
          {isCreatingWorkflow 
            ? "Setting up your workspace" 
            : error
              ? "Workspace Setup Issue"
              : "Your workspace is ready!"}
        </div>
        <div
          className="text-center text-base font-normal font-['Inter']"
          style={{ color: colors['text-secondary'] }}
        >
          {isCreatingWorkflow 
            ? "This may take a few moments..." 
            : error
              ? "We encountered an issue while setting up your workspace."
              : "Watch this short video to get started with ProcessFlow."}
        </div>
        
        {/* Video Container - Only show when no error */}
        {!error && (
          <div 
            className="w-full aspect-video rounded-lg mb-4 bg-gray-100 overflow-hidden"
            style={{ backgroundColor: colors['bg-secondary'] }}
          >
            <iframe
              ref={videoRef}
              className="w-full h-full"
              src="https://www.youtube.com/embed/8WyxhEpbx14" // Replace with your actual video URL
              title="ProcessFlow Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        {/* Creation Status */}
        <div className="flex flex-col items-center gap-4">
          {isCreatingWorkflow ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span style={{ color: colors['text-secondary'] }}>
                Setting up your workspace...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <svg 
                  className="w-6 h-6 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span style={{ color: colors['text-error'] }}>
                  {error}
                </span>
              </div>
              <div className="mt-2 text-sm text-center" style={{ color: colors['text-secondary'] }}>
                You can still proceed to the dashboard and try creating a workspace again.
              </div>
            </div>
          ) : isWorkflowCreated ? (
            <div className="flex items-center gap-3">
              <svg 
                className="w-6 h-6 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span style={{ color: colors['text-secondary'] }}>
                Your workspace is ready to use!
              </span>
            </div>
          ) : workflowCreationError ? (
            <div className="flex items-center gap-3">
              <svg 
                className="w-6 h-6 text-yellow-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span style={{ color: colors['text-warning'] }}>
                {workflowCreationError}
              </span>
            </div>
          ) : null}
        </div>
        
        {/* Continue Button - Always enabled after initial loading */}
        <div className="mt-6">
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={handleCompletedContinue}
            disabled={isCreatingWorkflow}
            className="w-full"
          >
            {error ? "Continue to Dashboard Anyway" : "Continue to Dashboard"}
          </ButtonNormal>
        </div>
        
        {/* Retry Button - Show when there's an error */}
        {error && error.includes("workspace with the name") && (
          <div className="mt-2">
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={() => {
                setCurrentStep('WORKSPACE_SETUP');
                setError('');
                setWorkspaceCreationStarted(false);
                localStorage.removeItem('workspaceCreationStarted');
              }}
              className="w-full"
            >
              Go Back and Change Workspace Name
            </ButtonNormal>
          </div>
        )}
        
        {/* Emergency Logout Button */}
        <div className="mt-4">
          <button
            onClick={handleEmergencyLogout}
            className="w-full text-red-500 text-sm font-medium py-2 hover:underline focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  // Progress indicator rendering based on current step
  const renderProgressIndicator = () => {
    if (currentStep === 'PERSONAL_INFO') {
      return (
        <div className="flex items-center justify-center w-64 my-4 mx-auto">
          {/* Active first step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]" style={{ backgroundColor: '#edf0fb' }}>
            <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          {/* Connecting line */}
          <div className="flex-grow h-[1px] bg-[#e4e7ec] mx-2"></div>
          
          {/* Inactive second step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-[#e4e7ec]" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
              <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
            </div>
          </div>
          
          {/* Connecting line */}
          <div className="flex-grow h-[1px] bg-[#e4e7ec] mx-2"></div>
          
          {/* Inactive third step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-[#e4e7ec]" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
              <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 'PROFESSIONAL_INFO') {
      return (
        <div className="flex items-center justify-center w-64 my-4 mx-auto">
          {/* Completed first step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />

          {/* Connecting line - completed */}
          <div className="flex-grow h-[1px] bg-[#4761c4] mx-2"></div>
          
          {/* Active second step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]" style={{ backgroundColor: '#edf0fb' }}>
            <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          {/* Connecting line */}
          <div className="flex-grow h-[1px] bg-[#e4e7ec] mx-2"></div>
          
          {/* Inactive third step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-[#e4e7ec]" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
              <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 'WORKSPACE_SETUP') {
      return (
        <div className="flex items-center justify-center w-64 my-4 mx-auto">
          {/* Completed first step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />

          {/* Connecting line - completed */}
          <div className="flex-grow h-[1px] bg-[#4761c4] mx-2"></div>
          
          {/* Completed second step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />
          
          {/* Connecting line */}
          <div className="flex-grow h-[1px] bg-[#4761c4] mx-2"></div>
          
          {/* Active third step */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]" style={{ backgroundColor: '#edf0fb' }}>
            <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 'COMPLETED') {
      return (
        <div className="flex items-center justify-center w-64 my-4 mx-auto">
          {/* Completed first step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />

          {/* Connecting line - completed */}
          <div className="flex-grow h-[1px] bg-[#4761c4] mx-2"></div>
          
          {/* Completed second step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />
          
          {/* Connecting line - completed */}
          <div className="flex-grow h-[1px] bg-[#4761c4] mx-2"></div>
          
          {/* Completed third step */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
            alt="Validated step icon"
            className="w-8 h-8"
          />
        </div>
      );
    }
    
    return null;
  };

  // Add effect to handle browser back button
  useEffect(() => {
    // Listen for popstate events (browser back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      // If workspace creation has started, prevent going back to onboarding steps
      if (workspaceCreationStarted) {
        // Prevent the default back behavior
        window.history.pushState(null, '', window.location.pathname);
        
        // Keep user on the completed step
        setCurrentStep('COMPLETED');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Add a history entry to capture back button
    window.history.pushState(null, '', window.location.pathname);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [workspaceCreationStarted]);

  return (
    <div
      className="w-full min-h-screen flex flex-col overflow-auto"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      <div className="w-full flex-1 flex flex-col items-center gap-8 py-6 px-4">
        {/* Fixed position logo */}
        <div className="w-[140px] sm:w-[180px] md:w-[240px] flex items-center">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
            alt="Logo ProcessFlow"
            className="w-full"
          />
        </div>
        
        {/* Fixed position progress indicator */}
        <div className="w-full">
          {renderProgressIndicator()}
        </div>
        
        {/* Content container */}
        <div className="w-full flex items-start justify-center pb-16">
          {/* Content for current step */}
          <AnimatePresence mode="wait">
            {currentStep === 'PERSONAL_INFO' && (
              <MotionStep key="personal-info-step">
                {renderPersonalInfoStep()}
              </MotionStep>
            )}
            
            {currentStep === 'PROFESSIONAL_INFO' && (
              <MotionStep key="professional-info-step">
                {renderProfessionalInfoStep()}
              </MotionStep>
            )}
            
            {currentStep === 'WORKSPACE_SETUP' && (
              <MotionStep key="workspace-setup-step">
                {renderWorkspaceSetupStep()}
              </MotionStep>
            )}
            
            {currentStep === 'COMPLETED' && (
              <MotionStep key="completed-step">
                {renderCompletedStep()}
              </MotionStep>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 