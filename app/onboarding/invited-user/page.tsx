'use client';

import { useState } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function InvitedUserOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'INVITED_USER',
          data: {
            onboarding_step: 'COMPLETED'
          }
        })
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Error completing invited user onboarding');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-[1280px] flex-col justify-center items-center gap-8 sm:gap-12 md:gap-[72px] inline-flex">
        {/* Logo Section - Responsive */}
        <div className="w-[180px] sm:w-[200px] md:w-[240px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className="w-full"
            />
          </div>
        </div>

        {/* Content Section - Responsive */}
        <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] flex-col justify-start items-start gap-4 sm:gap-6 inline-flex">
          {/* Top Content */}
          <div className="self-stretch flex-col justify-start items-center gap-4 flex">
            <div className="relative bg-[#edf0fb] w-14 h-14 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-onboarding.svg`}
                alt="Check Icon"
                className="w-8 h-8"
              />
            </div>
            <div className="self-stretch text-center text-[#101828] text-xl sm:text-2xl font-semibold leading-loose">
              Welcome to the workspace!
            </div>
            <div className="self-stretch text-center text-[#101828] text-sm sm:text-base font-normal leading-normal">
              You've been invited to join this workspace. You can start using ProcessFlow right away.
            </div>
          </div>

          <div className="h-10 flex justify-center items-start w-full mt-4">
            <ButtonNormal
              variant="primary"
              size="small"
              className="w-full"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Get Started"}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
} 