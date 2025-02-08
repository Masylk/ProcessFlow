"use client";
import React, { useState } from "react";

export default function AccessTheLinear() {
  const [selectedOption, setSelectedOption] = useState("linked");

  const handleClick = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow p-6 w-[600px]">
        {/* Titre */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 relative flex-col justify-center items-center flex overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/google.svg`}
              alt="google icon"
              className="w-6 h-6"
            />
          </div>
          <h2 className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
            4. Access the Linear
          </h2>
        </div>
        
        <p className="text-black text-sm font-normal font-['Inter'] leading-tight mb-3">
          Select an option
        </p>

        {/* -- Option 1 -- */}
        <div
          className={`cursor-pointer rounded-xl px-4 py-3 mb-3 ${
            selectedOption === "linked"
              ? "border-2 border-[#4e6bd7]"
              : "border border-[#e4e7ec]"
          }`}
          onClick={() => handleClick("linked")}
        >
          <div className="flex gap-2 items-start">
            {/* Radio */}
            {selectedOption === "linked" ? (
              <div className="w-4 h-4 p-[5px] bg-[#4761c4] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border border-[#d0d5dd]" />
            )}
            {/* Textes */}
            <div className="flex justify-center">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight ml-2">
                Linked
              </div>
            </div>
          </div>
        </div>
        {/* -- Option 2 -- */}
        <div
          className={`cursor-pointer rounded-xl px-4 py-3 mb-3 ${
            selectedOption === "notLinked"
              ? "border-2 border-[#4e6bd7]"
              : "border border-[#e4e7ec]"
          }`}
          onClick={() => handleClick("notLinked")}
        >
          <div className="flex gap-2 items-start">
            {/* Radio */}
            {selectedOption === "notLinked" ? (
              <div className="w-4 h-4 p-[5px] bg-[#4761c4] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border border-[#d0d5dd]" />
            )}
            {/* Textes */}
            <div className="flex justify-center">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight ml-2">
                Not Linked
              </div>
            </div>
          </div>
        </div>

        {/* -- Option 3 -- */}
        <div
          className={`cursor-pointer rounded-xl px-4 py-3 ${
            selectedOption === "noAccount"
              ? "border-2 border-[#4e6bd7]"
              : "border border-[#e4e7ec]"
          }`}
          onClick={() => handleClick("noAccount")}
        >
          <div className="flex gap-2 items-start">
            {/* Radio */}
            {selectedOption === "noAccount" ? (
              <div className="w-4 h-4 p-[5px] bg-[#4761c4] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border border-[#d0d5dd]" />
            )}
            {/* Textes */}
            <div className="flex justify-center">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight ml-2">
                No account yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
