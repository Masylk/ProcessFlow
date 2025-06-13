'use client';

import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';

const ProgressIndicator: React.FC = () => {
  const { currentStep } = useOnboarding();

  return (
    <div
      className="flex items-center justify-center w-64 my-4 mx-auto"
      data-testid="progress-indicator"
    >
      {/* First step indicator */}
      {currentStep === 'PERSONAL_INFO' ? (
        // Active first step
        <div
          className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]"
          style={{ backgroundColor: '#edf0fb' }}
        >
          <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ) : (
        // Completed first step
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
          alt="Validated step icon"
          className="w-8 h-8"
        />
      )}

      {/* First connecting line */}
      <div
        className={`flex-grow h-[1px] mx-2 ${
          currentStep === 'PERSONAL_INFO' ? 'bg-[#e4e7ec]' : 'bg-[#4761c4]'
        }`}
      />

      {/* Second step indicator */}
      {currentStep === 'PROFESSIONAL_INFO' ? (
        // Active second step
        <div
          className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]"
          style={{ backgroundColor: '#edf0fb' }}
        >
          <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ) : currentStep === 'PERSONAL_INFO' ? (
        // Inactive second step
        <div
          className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-[#e4e7ec]"
          style={{ backgroundColor: '#f9fafb' }}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
            <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
          </div>
        </div>
      ) : (
        // Completed second step
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
          alt="Validated step icon"
          className="w-8 h-8"
        />
      )}

      {/* Second connecting line */}
      <div
        className={`flex-grow h-[1px] mx-2 ${
          currentStep === 'PERSONAL_INFO' || currentStep === 'PROFESSIONAL_INFO'
            ? 'bg-[#e4e7ec]'
            : 'bg-[#4761c4]'
        }`}
      />

      {/* Third step indicator */}
      {currentStep === 'WORKSPACE_SETUP' ? (
        // Active third step
        <div
          className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#4761c4]"
          style={{ backgroundColor: '#edf0fb' }}
        >
          <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ) : currentStep === 'COMPLETED' ? (
        // Completed third step
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
          alt="Validated step icon"
          className="w-8 h-8"
        />
      ) : (
        // Inactive third step
        <div
          className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-[#e4e7ec]"
          style={{ backgroundColor: '#f9fafb' }}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
            <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
