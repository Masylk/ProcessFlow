'use client';

import { useEffect, useState } from 'react';
import UserInfo from './components/UserInfo';
import SearchBar from './components/SearchBar';
import UserDropdown from './components/UserDropdown';

interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  email: string;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200"></aside>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex justify-between items-center px-4 relative">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
          {/* Wrap UserInfo in a relative container to position the dropdown */}
          <div className="relative cursor-pointer" onClick={toggleDropdown}>
            <UserInfo user={user} />
            {dropdownVisible && (
              <div className="absolute top-full right-0 mt-2">
                <UserDropdown user={user} />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100"></main>
      </div>
    </div>
  );
}
