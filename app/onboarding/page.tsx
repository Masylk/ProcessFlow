'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useColors } from '@/app/theme/hooks';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import MotionStep from './components/MotionStep';
import ProgressIndicator from './components/ProgressIndicator';
import PersonalInfoStep from './components/PersonalInfoStep';
import ProfessionalInfoStep from './components/ProfessionalInfoStep';
import WorkspaceSetupStep from './components/WorkspaceSetupStep';
import CompletedStep from './components/CompletedStep';

// Main onboarding component wrapped with provider
export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

// Inner component that uses the onboarding context
function OnboardingContent() {
  const { currentStep, isLoadingInitialState, workspaceCreationStarted } = useOnboarding();
  
  // Use the colors hook which returns CSS variables
  const colors = useColors();
  
  // Add effect to ensure page is scrollable and uses light mode
  useEffect(() => {
    // Ensure the body has proper overflow behavior
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    
    // Force light theme styles for onboarding
    document.documentElement.classList.add('force-light-theme');
    document.documentElement.classList.remove('dark');
    
    return () => {
      // Reset on unmount
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.classList.remove('force-light-theme');
    };
  }, []);
  
  // Add effect to handle browser back button
  useEffect(() => {
    // Listen for popstate events (browser back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      // If workspace creation has started, prevent going back to onboarding steps
      if (workspaceCreationStarted) {
        // Prevent the default back behavior
        window.history.pushState(null, '', window.location.pathname);
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

  // Render loading state during initial check to prevent flashing of onboarding UI
  if (isLoadingInitialState) {
    return <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="large" />
    </div>;
  }
  
  // Render the actual onboarding content
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
          <ProgressIndicator />
        </div>
        
        {/* Content container */}
        <div className="w-full flex items-start justify-center pb-16">
          {/* Content for current step */}
          <AnimatePresence mode="wait">
            {currentStep === 'PERSONAL_INFO' && (
              <MotionStep key="personal-info-step">
                <PersonalInfoStep />
              </MotionStep>
            )}
            
            {currentStep === 'PROFESSIONAL_INFO' && (
              <MotionStep key="professional-info-step">
                <ProfessionalInfoStep />
              </MotionStep>
            )}
            
            {currentStep === 'WORKSPACE_SETUP' && (
              <MotionStep key="workspace-setup-step">
                <WorkspaceSetupStep />
              </MotionStep>
            )}
            
            {currentStep === 'COMPLETED' && (
              <MotionStep key="completed-step">
                <CompletedStep />
              </MotionStep>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 