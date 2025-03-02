"use client"

import { useState } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function PersonalInfo() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      return; // Validation simple
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/update', {
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
    <div className="w-full h-screen bg-white flex justify-center items-center">
      <div className="w-[1280px] h-[516px] flex-col justify-start items-center gap-[72px] inline-flex">
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
        <div className="w-[420px] h-[316px] flex-col justify-start items-start gap-6 flex">
          <div className="self-stretch text-center text-[#101828] text-2xl font-semibold">
            Welcome to ProcessFlow!
          </div>
          <div className="self-stretch text-center text-[#101828] text-base font-normal">
            You can always change your name later.
          </div>
          <div className="self-stretch h-[220px] pt-6 flex-col justify-start items-start gap-6 flex">
            <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
              <label className="text-[#344054] text-sm font-medium">Last Name</label>
              <input 
                type="text" 
                placeholder="Jobs" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="self-stretch px-3 py-2 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base focus:ring-2 focus:ring-[#4E6BD7] focus:outline-none"
              />
            </div>
            <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
              <label className="text-[#344054] text-sm font-medium">First Name</label>
              <input 
                type="text" 
                placeholder="Steve" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="self-stretch px-3 py-2 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base focus:ring-2 focus:ring-[#4E6BD7] focus:outline-none"
              />
            </div>
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