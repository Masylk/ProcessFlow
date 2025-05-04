'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';
import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useOnboarding } from '../context/OnboardingContext';
import { sanitizeNameInput } from '../utils/inputSanitizer';

const PersonalInfoStep: React.FC = () => {
  const colors = useColors();
  const { 
    personalInfo: { firstName, lastName, setFirstName, setLastName },
    isLoading,
    submitPersonalInfo
  } = useOnboarding();

  const handleLastNameChange = (value: string) => {
    // Allow spaces and only sanitize other characters
    if (value.length <= 40) {
      const sanitized = sanitizeNameInput(value);
      setLastName(sanitized);
    }
  };

  const handleFirstNameChange = (value: string) => {
    // Allow spaces and only sanitize other characters
    if (value.length <= 40) {
      const sanitized = sanitizeNameInput(value);
      setFirstName(sanitized);
    }
  };

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