'use client';

import React, { useRef } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useOnboarding } from '../context/OnboardingContext';

const CompletedStep: React.FC = () => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const {
    error,
    handleCompletedContinue,
    setCurrentStep,
    setError,
    setWorkspaceCreationStarted,
    workspaceInfo,
  } = useOnboarding();

  // Destructure from workspaceInfo
  const { isCreatingWorkflow, workflowCreationError } = workspaceInfo;

  // Add a manual logout function that will clear all authentication data
  const handleEmergencyLogout = () => {
    // Clear all storage data
    localStorage.clear();
    sessionStorage.clear();

    // Clear any auth cookies by setting them to expired
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Force reload to the root page
    window.location.href = '/';
  };

  return (
    <div
      className="w-full max-w-[600px] flex flex-col gap-6 mx-auto"
      data-testid="completed-step"
    >
      <div className="text-center text-2xl font-semibold font-['Inter'] text-gray-900">
        {isCreatingWorkflow
          ? 'Setting up your workspace'
          : error
            ? 'Workspace Setup Issue'
            : 'Your workspace is ready!'}
      </div>
      <div className="text-center text-base font-normal font-['Inter'] text-gray-600">
        {isCreatingWorkflow
          ? 'This will take less than a minute.'
          : error
            ? 'We encountered an issue while setting up your workspace.'
            : 'Watch this short video to get started with ProcessFlow.'}
      </div>
      {/* Video Container - Only show when no error */}
      {!error && (
        <div className="w-full aspect-video rounded-lg mb-4 bg-gray-100 overflow-hidden">
          <iframe
            ref={videoRef}
            className="w-full h-full"
            src="https://www.youtube.com/embed/8WyxhEpbx14"
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
            <span className="text-gray-600">Setting up your workspace...</span>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              <span className="text-red-500">{error}</span>
            </div>
            <div className="mt-2 text-sm text-center text-gray-600">
              You can still proceed to the dashboard and try creating a
              workspace again.
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span data-testid="workspace-ready-message" className="text-gray-600">
              Your workspace is ready to use!
            </span>
          </div>
        )}
        {workflowCreationError && !isCreatingWorkflow && !error && (
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span className="text-yellow-500">{workflowCreationError}</span>
          </div>
        )}
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
          {error ? 'Continue to Dashboard Anyway' : 'Continue to Dashboard'}
        </ButtonNormal>
      </div>
      {/* Retry Button - Show when there's an error */}
      {error && error.includes('workspace with the name') && (
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
      <div className="mt-4 hidden">
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

export default CompletedStep;
