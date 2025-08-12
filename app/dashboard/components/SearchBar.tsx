// components/SearchBar.tsx
'use client';

import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleChange = (value: string) => {
    onSearchChange({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleAssistantClick = () => {
    // Get the current workspace slug from the URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const workspaceSlug = pathSegments.length > 0 ? pathSegments[0] : '';

    if (workspaceSlug) {
      router.push(`/${workspaceSlug}/assistant`);
    } else {
      router.push('/assistant');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-[350px] flex items-center transition-all duration-200 hover:scale-[1.02]">
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

      {/* Assistant Button */}
      <ButtonNormal
        variant="secondary"
        size="small"
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/container.svg`}
        onClick={handleAssistantClick}
        data-testid="assistant-button"
      >
        Assistant
      </ButtonNormal>
    </div>
  );
}
