'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type OnboardingStep =
  | 'PERSONAL_INFO'
  | 'PROFESSIONAL_INFO'
  | 'WORKSPACE_SETUP'
  | 'COMPLETED';

interface OnboardingContextType {
  // Step management
  currentStep: OnboardingStep;
  setCurrentStep: (step: OnboardingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Global state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  isLoadingInitialState: boolean;

  // Flags
  workspaceCreationStarted: boolean;
  setWorkspaceCreationStarted: (started: boolean) => void;
  isNavigatingBack: boolean;
  setIsNavigatingBack: (navigating: boolean) => void;

  // Step data
  personalInfo: {
    firstName: string;
    lastName: string;
    setFirstName: (name: string) => void;
    setLastName: (name: string) => void;
  };

  professionalInfo: {
    industry: string;
    role: string;
    companySize: string;
    source: string;
    setIndustry: (industry: string) => void;
    setRole: (role: string) => void;
    setCompanySize: (size: string) => void;
    setSource: (source: string) => void;
  };

  workspaceInfo: {
    workspaceName: string;
    workspaceURL: string;
    logo: string | null;
    logoFile: File | null;
    isCreatingWorkflow: boolean;
    isWorkflowCreated: boolean;
    workflowCreationError: string;
    setWorkspaceName: (name: string) => void;
    setWorkspaceURL: (url: string) => void;
    setLogo: (logo: string | null) => void;
    setLogoFile: (file: File | null) => void;
    setIsCreatingWorkflow: (creating: boolean) => void;
    setIsWorkflowCreated: (created: boolean) => void;
    setWorkflowCreationError: (error: string) => void;
    createWorkspace: () => Promise<void>;
  };

  // API Functions
  submitPersonalInfo: () => Promise<void>;
  submitProfessionalInfo: () => Promise<void>;
  submitWorkspaceSetup: () => void;

  // Completed step functions
  handleCompletedContinue: () => Promise<void>;
}

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] =
    useState<OnboardingStep>('PERSONAL_INFO');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingInitialState, setIsLoadingInitialState] =
    useState<boolean>(true);
  const [workspaceCreationStarted, setWorkspaceCreationStarted] =
    useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // Personal Info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Professional Info state
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [source, setSource] = useState('');

  // Workspace setup state
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceURL, setWorkspaceURL] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isWorkflowCreated, setIsWorkflowCreated] = useState(false);
  const [workflowCreationError, setWorkflowCreationError] = useState('');

  // Check server-side onboarding status
  useEffect(() => {
    const checkServerOnboardingStatus = async () => {
      try {
        setIsLoadingInitialState(true);
        const response = await fetch('/api/auth/check-onboarding');

        if (response.ok) {
          const data = await response.json();
          console.log('Server onboarding status:', data);

          // If the server says onboarding is completed, redirect to dashboard
          if (data.completed) {
            router.push('/');
            return;
          }

          // Trust the server's state about what step we're on
          const serverStep = data.onboardingStep as OnboardingStep;

          // Override local state with server state
          setCurrentStep(serverStep);

          // Only set workspace creation started if we're on the COMPLETED step
          const shouldMarkCreationStarted = serverStep === 'COMPLETED';
          setWorkspaceCreationStarted(shouldMarkCreationStarted);

          // Sync localStorage with server state
          if (shouldMarkCreationStarted) {
            localStorage.setItem('workspaceCreationStarted', 'true');
          } else {
            localStorage.removeItem('workspaceCreationStarted');
          }
        } else {
          console.error(
            'Error fetching onboarding status:',
            await response.text()
          );
        }
      } catch (error) {
        console.error('Exception checking onboarding status:', error);
      } finally {
        setIsLoadingInitialState(false);
      }
    };

    checkServerOnboardingStatus();
  }, [router]);

  // Load saved data for each step
  useEffect(() => {
    // Skip if we're still loading the initial state from server
    if (isLoadingInitialState) return;

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
          }
          if (parsedData.workspaceURL) setWorkspaceURL(parsedData.workspaceURL);
          if (parsedData.logo) setLogo(parsedData.logo);
        } catch (e) {
          console.warn('Error loading saved workspace data:', e);
        }
      }
    }

    // Start creating workspace and workflow when user reaches the completed step
    if (
      currentStep === 'COMPLETED' &&
      !isWorkflowCreated &&
      !isCreatingWorkflow &&
      !error
    ) {
      console.log('Starting workspace creation from completed step effect');
      createWorkspace();

      // Set flag that workspace creation has started if not already set
      if (!workspaceCreationStarted) {
        setWorkspaceCreationStarted(true);
      }
    }
  }, [
    currentStep,
    workspaceCreationStarted,
    isLoadingInitialState,
    isWorkflowCreated,
    isCreatingWorkflow,
    error,
  ]);

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

    if (
      currentStep === 'PROFESSIONAL_INFO' &&
      (industry || role || companySize || source)
    ) {
      localStorage.setItem(
        'professionalInfoData',
        JSON.stringify({
          industry,
          role,
          companySize,
          source,
        })
      );
    }

    if (
      currentStep === 'WORKSPACE_SETUP' &&
      (workspaceName || workspaceURL || logo)
    ) {
      localStorage.setItem(
        'workspaceSetupData',
        JSON.stringify({
          workspaceName,
          workspaceURL,
          logo,
        })
      );
    }
  }, [
    firstName,
    lastName,
    industry,
    role,
    companySize,
    source,
    workspaceName,
    workspaceURL,
    logo,
    currentStep,
  ]);

  // Step navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case 'PERSONAL_INFO':
        setCurrentStep('PROFESSIONAL_INFO');
        break;
      case 'PROFESSIONAL_INFO':
        setCurrentStep('WORKSPACE_SETUP');
        break;
      case 'WORKSPACE_SETUP':
        setCurrentStep('COMPLETED');
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    // If workspace creation has started, don't allow navigation back
    if (workspaceCreationStarted) {
      setCurrentStep('COMPLETED');
      return;
    }

    switch (currentStep) {
      case 'PROFESSIONAL_INFO':
        setCurrentStep('PERSONAL_INFO');
        break;
      case 'WORKSPACE_SETUP':
        setCurrentStep('PROFESSIONAL_INFO');
        break;
      case 'COMPLETED':
        setCurrentStep('WORKSPACE_SETUP');
        break;
      default:
        break;
    }
  };

  // Form submission functions
  const submitPersonalInfo = async () => {
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

  const submitProfessionalInfo = async () => {
    if (!industry || !role || !companySize || !source) {
      setError('Please fill in all fields');
      return;
    }

    // First update the UI state to provide immediate feedback
    setCurrentStep('WORKSPACE_SETUP');
    setError('');

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
            onboarding_step: 'WORKSPACE_SETUP',
          },
        }),
      });
    } catch (error) {
      console.error(
        'Client error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      // Don't show error message or reset the step if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const submitWorkspaceSetup = () => {
    if (!workspaceName) {
      setError('Workspace name is required');
      return;
    }

    // Just transition to completed step without creating workspace yet
    setCurrentStep('COMPLETED');
  };

  // Workspace creation function
  const createWorkspace = async () => {
    // Prevent multiple simultaneous attempts
    if (isLoading || isCreatingWorkflow) return;

    setIsLoading(true);
    setError('');
    setIsCreatingWorkflow(true);

    // Mark that workspace creation has started - prevents going back to previous steps
    setWorkspaceCreationStarted(true);
    localStorage.setItem('workspaceCreationStarted', 'true');

    // Get the initial slug
    let currentSlug =
      workspaceURL ||
      workspaceName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '');

    const MAX_RETRIES = 5;
    let retryCount = 0;
    let success = false;

    // console.log(`Attempting to create workspace with name: "${workspaceName}" and slug: "${currentSlug}"`);

    while (!success && retryCount <= MAX_RETRIES) {
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
              workspace_url: currentSlug,
              workspace_icon_url: logo || null,
              onboarding_step: 'COMPLETED',
            },
          }),
        });

        if (response.ok) {
          success = true;
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `Workspace created successfully with slug: "${currentSlug}"`
            );
          }

          // Verify that onboarding state is properly updated on the server
          const onboardingCheck = await fetch('/api/auth/check-onboarding');
          if (onboardingCheck.ok) {
            const onboardingData = await onboardingCheck.json();
            if (process.env.NODE_ENV === 'development') {
              console.log(
                'Onboarding status after workspace creation:',
                onboardingData
              );
            }

            if (!onboardingData.completed) {
              console.warn(
                'Server still shows onboarding as incomplete after workspace creation'
              );
            }
          }

          // After workspace creation succeeds, create the default workflow
          await initializeDefaultWorkflow();
        } else {
          const data = await response.json();
          console.error('Workspace creation failed with error:', data);

          // Check for slug constraint violation
          const isSlugError =
            data.error &&
            ((data.error.includes('constraint failed') &&
              data.error.includes('slug')) ||
              data.error.includes('duplicate key') ||
              data.error.includes('already exists') ||
              data.error.includes('unique constraint'));

          if (isSlugError) {
            retryCount++;

            if (retryCount <= MAX_RETRIES) {
              currentSlug = `${
                workspaceURL ||
                workspaceName
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-zA-Z0-9-]/g, '')
              }-${retryCount}`;
              console.log(
                `Retrying workspace creation with modified slug: "${currentSlug}" (attempt ${retryCount} of ${MAX_RETRIES})`
              );
            } else {
              console.error(
                `Max retries (${MAX_RETRIES}) reached. Unable to create workspace.`
              );
              setError(
                `Unable to create workspace with the name "${workspaceName}". Please try a different name.`
              );
              setIsWorkflowCreated(false);
            }
          } else {
            console.error('Non-slug related error:', data.error);
            setError(
              data.error || 'An error occurred while creating your workspace'
            );
            setIsWorkflowCreated(false);
            break;
          }
        }
      } catch (error) {
        console.error('Exception during workspace creation:', error);
        setError('A connection error occurred. Please try again.');
        setIsWorkflowCreated(false);
        break;
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
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.workflowIds) && data.workflowIds.length > 0) {
          setIsWorkflowCreated(true);
        } else {
          setWorkflowCreationError('No workflows were created');
          setIsWorkflowCreated(false);
        }
      } else {
        const data = await response.json();
        setWorkflowCreationError(
          data.error || 'Failed to create default workflows'
        );
        // Still set as created so user can continue
        setIsWorkflowCreated(true);
      }
    } catch (error) {
      console.error('Error creating default workflows:', error);
      setWorkflowCreationError(
        'Connection error while creating default workflows'
      );
      // Still set as created so user can continue
      setIsWorkflowCreated(true);
    }
  };

  // Handle completed step continue button
  const handleCompletedContinue = async () => {
    // Clear all onboarding data
    localStorage.removeItem('personalInfoData');
    localStorage.removeItem('professionalInfoData');
    localStorage.removeItem('workspaceSetupData');

    // Verify with the server that onboarding is actually complete
    try {
      const response = await fetch('/api/auth/check-onboarding');
      if (response.ok) {
        const data = await response.json();

        if (!data.completed) {
          console.warn(
            'Server reports onboarding incomplete, but proceeding to dashboard'
          );

          // Force update on server that onboarding is complete to prevent being stuck
          await fetch('/api/onboarding/force-complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch((err) => {
            console.error('Failed to force complete onboarding:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error verifying onboarding completion:', error);
    }

    // Force navigation to dashboard even if there were errors
    router.push('/');
  };

  const value = {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,

    isLoading,
    setIsLoading,
    error,
    setError,
    isLoadingInitialState,

    workspaceCreationStarted,
    setWorkspaceCreationStarted,
    isNavigatingBack,
    setIsNavigatingBack,

    personalInfo: {
      firstName,
      lastName,
      setFirstName,
      setLastName,
    },

    professionalInfo: {
      industry,
      role,
      companySize,
      source,
      setIndustry,
      setRole,
      setCompanySize,
      setSource,
    },

    workspaceInfo: {
      workspaceName,
      workspaceURL,
      logo,
      logoFile,
      isCreatingWorkflow,
      isWorkflowCreated,
      workflowCreationError,
      setWorkspaceName,
      setWorkspaceURL,
      setLogo,
      setLogoFile,
      setIsCreatingWorkflow,
      setIsWorkflowCreated,
      setWorkflowCreationError,
      createWorkspace,
    },

    submitPersonalInfo,
    submitProfessionalInfo,
    submitWorkspaceSetup,

    handleCompletedContinue,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
