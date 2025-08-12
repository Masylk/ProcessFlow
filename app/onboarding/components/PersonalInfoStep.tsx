'use client';

import React from 'react';
import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useOnboarding } from '../context/OnboardingContext';
import { sanitizeNameInput } from '../utils/inputSanitizer';

const PersonalInfoStep: React.FC = () => {
  const {
    personalInfo: { firstName, lastName, setFirstName, setLastName },
    isLoading,
    submitPersonalInfo,
  } = useOnboarding();

  const handleLastNameChange = (value: string) => {
    // Allow spaces and special characters, only limit length
    if (value.length <= 40) {
      const sanitized = sanitizeNameInput(value);
      setLastName(sanitized);
    }
  };

  const handleFirstNameChange = (value: string) => {
    // Allow spaces and special characters, only limit length
    if (value.length <= 40) {
      const sanitized = sanitizeNameInput(value);
      setFirstName(sanitized);
    }
  };

  return (
    <div
      className="w-full max-w-[442px] flex flex-col gap-6 mx-auto"
      data-testid="personal-info-step"
    >
      <div className="text-center text-2xl font-semibold font-['Inter'] text-gray-900 dark:text-white">
        Welcome to ProcessFlow!
      </div>
      <div className="text-center text-base font-normal font-['Inter'] text-gray-600 dark:text-gray-300">
        You can always change your name later.
      </div>
      <div className="pt-6 flex-col gap-6 flex">
        <InputField
          dataTestId="last-name-input"
          label="Last Name"
          placeholder="Jobs"
          value={lastName}
          onChange={handleLastNameChange}
          type="default"
          size="medium"
        />
        <InputField
          dataTestId="first-name-input"
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
            onClick={submitPersonalInfo}
            disabled={isLoading || !firstName || !lastName}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </ButtonNormal>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
