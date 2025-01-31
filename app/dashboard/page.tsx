'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data) {
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200"></aside>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex justify-between items-center px-4">
          {/* Search Bar */}
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
              value={searchTerm} // Bind the value to searchTerm state
              onChange={handleSearchChange} // Update state on input change
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
          {/* User Info */}
          <div className="h-16 flex-col border-l border-gray-50 justify-start items-start inline-flex">
            <div className="h-16 px-4 py-3 flex-col justify-start items-start flex">
              <div className="self-stretch justify-start items-center gap-3 inline-flex">
                <div className="w-10 h-10 rounded-full justify-center items-center flex">
                  <div className="w-10 h-10 relative rounded-full border border-black/10" />
                </div>
                <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                  <div className="self-stretch text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                    {user ? user.full_name : 'Loading...'}
                  </div>
                  <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                    {user ? user.email : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100"></main>
      </div>
    </div>
  );
}
