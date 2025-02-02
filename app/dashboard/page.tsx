'use client';

import { useEffect, useState } from 'react';
import UserInfo from './components/UserInfo';
import SearchBar from './components/SearchBar';
import UserDropdown from './components/UserDropdown';
import UserSettings from './components/UserSettings';
import Sidebar from './components/Sidebar';

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

interface Workspace {
  id: number;
  name: string;
  teamTags: string[];
}

export default function Page() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
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

  // Fetch the signed URL if needed
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

  // Fetch workspaces specific to the user
  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async (userId: string) => {
        const res = await fetch(`/api/workspaces/${userId}`);
        const data = await res.json();
        if (data.error) {
          console.error('Error fetching workspaces:', data.error);
        } else {
          setWorkspaces(data);
        }
      };

      fetchWorkspaces(user.id.toString());
    }
  }, [user]);

  const addWorkspace = async (workspaceName: string) => {
    if (!user) return;
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: workspaceName,
        user_id: user.id,
      }),
    });
    // Vous pourrez rafraîchir la liste des workspaces ici si nécessaire
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Toggle du dropdown
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const openUserSettings = () => {
    setUserSettingsVisible(true);
    setDropdownVisible(false);
  };

  const closeUserSettings = () => {
    setUserSettingsVisible(false);
  };

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = (user: User) => {
    setUser(user);
  };

  return (
    <>
      <div className="flex h-screen w-screen">
        {/* Sidebar avec le header et la liste des workspaces */}
        {user && user.email && (
          <Sidebar workspaces={workspaces} userEmail={user?.email} />
        )}

        <div className="flex flex-col flex-1">
          {/* Header de la page */}
          <header className="h-[72px] bg-white border-b border-gray-200 flex justify-between items-center px-4 relative">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <div className="relative cursor-pointer" onClick={toggleDropdown}>
              <UserInfo user={user} />
              {dropdownVisible && (
                <div className="absolute top-full right-0 mt-2">
                  <UserDropdown
                    user={user}
                    onOpenUserSettings={openUserSettings}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 bg-gray-100"></main>
        </div>
      </div>

      {/* Modal pour les réglages utilisateur */}
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
