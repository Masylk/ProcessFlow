'use client';

import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function OnboardingCompleted() {
  const router = useRouter();

  const handleLaunch = async () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      <div className="w-full h-screen flex-col justify-center items-center gap-[72px] inline-flex">
        {/* Logo Section */}
        <div className="w-[159px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className=""
            />
          </div>
        </div>

        {/* New Design Section */}
        <div className="w-[420px] h-56 flex-col justify-start items-start gap-6 inline-flex">
          {/* Top Content */}
          <div className="self-stretch h-72 flex-col justify-start items-center gap-4 flex">
            <div className="relative bg-[#edf0fb] rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-onboarding.svg`}
                alt="Check Icon"
                className=""
              />
            </div>
            <div className="self-stretch text-center text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
              You're all set!
            </div>
            <div className="self-stretch text-center text-[#101828] text-base font-normal font-['Inter'] leading-normal">
              Let us take you through.
            </div>
          </div>

          <div className="h-10 flex justify-center items-start w-full">
            <ButtonNormal
              variant="primary"
              size="small"
              className="w-full"
              onClick={handleLaunch}
            >
              Launch ProcessFlow
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
} 