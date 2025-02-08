// components/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="w-[350px] h-10 p-4 bg-white rounded-lg border border-[#e4e7ec] justify-start items-center gap-2 inline-flex overflow-hidden">
      <img
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
        alt="Search Icon"
        className="w-5 h-5"
      />
      <input
        type="text"
        placeholder="Search"
        className="grow shrink basis-0 text-[#667085] text-base font-normal font-['Inter'] leading-normal outline-none"
        value={searchTerm}
        onChange={onSearchChange}
      />
      <div className="justify-start items-center gap-1 flex">
        <div className="px-1 py-0.5 bg-gray-50 rounded border border-[#e4e7ec] justify-start items-start flex">
          <div className="text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
            ⌘
          </div>
        </div>
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-grey.svg`}
          alt="Plus Icon"
          className="w-4 h-4"
        />
        <div className="h-6 px-1 py-0.5 bg-gray-50 rounded border border-[#e4e7ec] justify-start items-start flex">
          <div className="grow shrink basis-0 text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
            F
          </div>
        </div>
      </div>
    </div>
  );
}
