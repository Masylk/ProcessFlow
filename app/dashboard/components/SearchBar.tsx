// components/SearchBar.tsx
'use client';

import InputField from '@/app/components/InputFields';
import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (value: string) => {
    onSearchChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="w-[350px] flex items-center">
      <div className="flex-grow">
        <InputField
          type="icon-leading"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search"
          iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
        />
      </div>
    </div>
  );
}
