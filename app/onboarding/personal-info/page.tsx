"use client"

import { useState, useEffect } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useRouter } from 'next/navigation';
import { useColors } from '@/app/theme/hooks';

export default function PersonalInfo() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const router = useRouter();
  const colors = useColors();

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('personalInfoData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFirstName(parsedData.firstName || "");
        setLastName(parsedData.lastName || "");
      } catch (e) {
        console.warn('Error loading saved personal info data:', e);
      }
    }
  }, []);

  // Save form data when it changes
  useEffect(() => {
    if (firstName || lastName) {
      localStorage.setItem('personalInfoData', JSON.stringify({
        firstName,
        lastName
      }));
    }
  }, [firstName, lastName]);

  const handleLastNameChange = (value: string) => {
    setLastName(value);
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
  };

  useEffect(() => {
    const handlePopState = async (e: PopStateEvent) => {
      // Prevent the default back navigation
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);

      if (isNavigatingBack) return;
      setIsNavigatingBack(true);

      try {
        const response = await fetch('/api/onboarding/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'PERSONAL_INFO',
            data: {
              onboarding_step: 'WELCOME',
              is_navigating_back: true
            }
          })
        });

        if (response.ok) {
          // Only navigate after successful update
          window.location.href = '/onboarding/welcome';
        } else {
          console.error('Failed to update onboarding step');
          setIsNavigatingBack(false);
        }
      } catch (error) {
        console.error('Error updating onboarding step:', error);
        setIsNavigatingBack(false);
      }
    };

    // Push the current state to enable back button
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isNavigatingBack]);

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      return; // Validation simple
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/email', {
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
            onboarding_step: 'PROFESSIONAL_INFO'
          }
        })
      });

      if (response.ok) {
        router.push('/onboarding/professional-info');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full h-screen flex justify-center items-center"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      <div className="max-w-[1280px] w-full px-4 flex flex-col justify-center items-center gap-[72px]">
        <div className="w-[240px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`} 
              alt="Logo ProcessFlow" 
              className="w-full" 
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="relative flex items-center w-64">
            <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-[#edf0fb] rounded-full border-2 border-[#4761c4]">
              <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex-grow h-0.5 bg-[#e4e7ec] mx-2"></div>
            <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-gray-50 rounded-full border border-[#e4e7ec]">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
                <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
              </div>
            </div>
            <div className="flex-grow h-0.5 bg-[#e4e7ec] mx-2"></div>
            <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-gray-50 rounded-full border border-[#e4e7ec]">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
                <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-[420px] flex-col justify-start items-start gap-6 flex">
          <div 
            className="self-stretch text-center text-2xl font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Welcome to ProcessFlow!
          </div>
          <div 
            className="self-stretch text-center text-base font-normal"
            style={{ color: colors['text-secondary'] }}
          >
            You can always change your name later.
          </div>
          <div className="self-stretch pt-6 flex-col justify-start items-start gap-6 flex">
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
            <div className="h-10 flex justify-center items-start w-full">
              <ButtonNormal
                variant="primary"
                size="small"
                onClick={handleSubmit}
                disabled={isLoading}
                trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
                className="w-full"
              >
                {isLoading ? "Loading..." : "Continue"}
              </ButtonNormal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 