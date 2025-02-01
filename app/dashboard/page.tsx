'use client';

import { useEffect, useState } from 'react';
import UserInfo from './components/UserInfo';
import SearchBar from './components/SearchBar';
import UserDropdown from './components/UserDropdown';
import UserSettings from './components/UserSettings';

interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  avatar_signed_url?: string;
  email: string;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [userSettingsVisible, setUserSettingsVisible] =
    useState<boolean>(false);

  // Fetch user data from your API
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

  // Fetch the signed URL only if the user has an avatar_url but no avatar_signed_url
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (user && user.avatar_url && !user.avatar_signed_url) {
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(user.avatar_url)}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }
          const data = await response.json();
          setUser((prevUser) =>
            prevUser ? { ...prevUser, avatar_signed_url: data.signedUrl } : null
          );
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchSignedUrl();
  }, [user]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  // Open the UserSettings modal and close the dropdown
  const openUserSettings = () => {
    setUserSettingsVisible(true);
    setDropdownVisible(false);
  };

  // Close the UserSettings modal
  const closeUserSettings = () => {
    setUserSettingsVisible(false);
  };

  // Function to update the user state after updating user info
  const updateUser = (user: User) => {
    setUser(user);
  };

  return (
    <>
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
                  {/* Pass the onOpenUserSettings callback to UserDropdown */}
                  <UserDropdown
                    user={user}
                    onOpenUserSettings={openUserSettings}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-100"></main>
        </div>
      </div>

      {/* Render the UserSettings modal as an overlay if visible */}
      {user && userSettingsVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UserSettings
            user={user}
            onClose={closeUserSettings}
            onUserUpdate={updateUser}
          />
        </div>
      )}
    </>
  );
}
