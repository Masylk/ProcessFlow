'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useOnboarding } from '../context/OnboardingContext';

const ProfessionalInfoStep: React.FC = () => {
  const colors = useColors();
  const { 
    professionalInfo: { 
      industry, 
      role, 
      companySize, 
      source,
      setIndustry,
      setRole,
      setCompanySize,
      setSource
    },
    isLoading,
    error,
    submitProfessionalInfo,
    goToPreviousStep
  } = useOnboarding();

  // Dropdown options
  const dropdownOptions = {
    industry: ['IT', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'],
    role: ['Founder', 'Manager', 'Product Manager', 'Analyst', 'Designer', 'Sales', 'Marketing', 'HR', 'Customer Success', 'Freelancer', 'Other'],
    companySize: ['1', '2-9', '10-49', '50-199', '200-499', '500+'],
    source: ['ProductHunt', 'LinkedIn', 'Google', 'Friend', 'Other'],
  };

  return (
    <div className="w-full max-w-[500px] flex flex-col gap-4 sm:gap-6 mb-8 mx-auto">
      <div 
        className="self-stretch text-center text-xl md:text-2xl font-semibold font-['Inter'] leading-loose"
        style={{ color: colors['text-primary'] }}
      >
        Tell us about yourself
      </div>
      <div 
        className="self-stretch text-center text-sm md:text-base font-normal font-['Inter'] leading-normal"
        style={{ color: colors['text-secondary'] }}
      >
        This information will be used to improve your experience.
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

      <div className="h-10 flex flex-row justify-between items-start w-full mt-2 md:mt-4 gap-4">
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
          onClick={submitProfessionalInfo}
          disabled={isLoading || !industry || !role || !companySize || !source}
          className="w-2/3"
        >
          Continue
        </ButtonNormal>
      </div>
    </div>
  );
};

export default ProfessionalInfoStep; 