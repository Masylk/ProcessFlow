"use client"

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [source, setSource] = useState("");

  const dropdownOptions = {
    industry: ["IT", "Healthcare", "Finance", "Education", "Retail"],
    role: ["Freelancer", "Manager", "Developer", "Designer", "Analyst"],
    companySize: ["1", "2-9", "10-49", "50-199", "200-499", "500+"],
    source: ["ProductHunt", "LinkedIn", "Google", "Friend", "Other"]
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      <div className="w-[1280px] h-[516px] flex-col justify-start items-center gap-[72px] inline-flex">
        <div className="w-[159px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`} 
              alt="Logo ProcessFlow" 
              className="" 
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="relative flex items-center w-64">
            {/* First Step - Validated */}
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`} 
              alt="Validated step icon" 
              className="w-8 h-8" 
            />

            {/* Progress Bar */}
            <div className="flex-grow h-0.5 bg-[#4761c4] mx-2"></div>
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
          </div>
        </div>
        <div className="h-[244px] flex-col justify-start items-start gap-6 inline-flex">
        <div className="self-stretch text-center text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
              Welcome to ProcessFlow!
            </div>
            <div className="self-stretch text-center text-[#101828] text-base font-normal font-['Inter'] leading-normal">
              You will still be able to modify your workspace later.
            </div>
        <div className="w-[500px] flex pt-6 justify-start items-center gap-2">
            <div className="flex items-center space-x-2">
            <div className="whitespace-nowrap text-black text-base font-normal leading-normal">
                I work in
            </div>
            <div className="flex-grow relative">
                <select
                className="w-[180px] px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                >
                {dropdownOptions.industry.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
            </div>
            </div>
                

        <div className="whitespace-nowrap text-black text-base font-normal leading-normal">as a</div>
            <div className="relative w-[200px]">
                <select
                    className="w-full basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    >
                    {dropdownOptions.role.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
        </div>
    </div>
  
        <div className="relative self-stretch justify-start items-center gap-2 inline-flex">
            <div className="text-black text-base font-normal leading-normal">for a company of</div>
            <select
            className="grow shrink basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
            value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    >
                    {dropdownOptions.companySize.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
        </div>

        <div className="relative self-stretch justify-start items-center gap-2 inline-flex">
            <div className="text-black text-base font-normal leading-normal">I learned about ProcessFlow from</div>
            <select
            className="grow shrink basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
            value={source}
                    onChange={(e) => setSource(e.target.value)}
                    >
                    {dropdownOptions.source.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
        </div>

        <div className="h-10 flex justify-between items-start w-full">
  {/* Back Button */}
  <div
    className="px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden transition-all duration-300 hover:bg-[#F9FAFB] cursor-pointer"
  >
    <img
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
      alt="Arrow left icon"
      className="w-5 h-5"
    />
    <div className="px-0.5 justify-center items-center flex">
      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
        Back
      </div>
    </div>
  </div>

  {/* Continue Button */}
  <div
    className="px-3.5 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border-2 border-white justify-center items-center gap-1 flex overflow-hidden transition-all duration-300 hover:bg-[#374C99] cursor-pointer"
  >
    <div className="px-0.5 justify-center items-center flex">
      <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
        Continue
      </div>
    </div>
    <img
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
      alt="White arrow right icon"
      className="w-5 h-5"
    />
  </div>
</div>
        </div>

      </div>
    </div>
  );
}
