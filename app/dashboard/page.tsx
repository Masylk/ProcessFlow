'use client';

import { useEffect, useState, useRef } from 'react';
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
  active_workspace?: number;
  email: string;
}

interface Workspace {
  id: number;
  name: string;
  teamTags?: string[];
}

export default function Page() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [userSettingsVisible, setUserSettingsVisible] =
    useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );

  // Ref used as a flag so that the active_workspace update is performed only once
  const activeWorkspaceUpdatedRef = useRef(false);

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

  // Effect to set activeWorkspace.
  // If user.active_workspace is not set, we choose the first workspace and update the user in the DB.
  useEffect(() => {
    if (user && workspaces.length > 0) {
      // If active_workspace is not defined, update it with the first workspace.
      if (!user.active_workspace) {
        if (!activeWorkspaceUpdatedRef.current) {
          // Only update if activeWorkspace is not already set to the first one
          if (!activeWorkspace || activeWorkspace.id !== workspaces[0].id) {
            setActiveWorkspace(workspaces[0]);
          }
          activeWorkspaceUpdatedRef.current = true; // Prevent further updates in subsequent renders
          const updateActiveWorkspace = async () => {
            const updateRes = await fetch('/api/user/update', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                active_workspace: workspaces[0].id,
              }),
            });
            if (updateRes.ok) {
              const updatedUser = await updateRes.json();
              // Only update the user if the active_workspace changed
              if (updatedUser.active_workspace !== user.active_workspace) {
                setUser(updatedUser);
              }
            } else {
              console.error('Error updating user active_workspace');
            }
          };
          updateActiveWorkspace();
        }
      } else {
        // If active_workspace exists, find it in the list.
        const foundWorkspace = workspaces.find(
          (ws) => ws.id === user.active_workspace
        );
        if (foundWorkspace) {
          // Only update if different from current activeWorkspace
          if (!activeWorkspace || activeWorkspace.id !== foundWorkspace.id) {
            setActiveWorkspace(foundWorkspace);
          }
        } else {
          // If the workspace referenced by the user isn't found, use the first workspace
          if (!activeWorkspaceUpdatedRef.current) {
            if (!activeWorkspace || activeWorkspace.id !== workspaces[0].id) {
              setActiveWorkspace(workspaces[0]);
            }
            activeWorkspaceUpdatedRef.current = true;
            const updateActiveWorkspace = async () => {
              const updateRes = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: user.id,
                  active_workspace: workspaces[0].id,
                }),
              });
              if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                if (updatedUser.active_workspace !== user.active_workspace) {
                  setUser(updatedUser);
                }
              } else {
                console.error('Error updating user active_workspace');
              }
            };
            updateActiveWorkspace();
          }
        }
      }
    }
  }, [user, workspaces]); // Notice we do not include activeWorkspace in the dependency array

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
    // You may refresh the workspaces list here if necessary
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Toggle the dropdown
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

  // Function to update the user in state
  const updateUser = (user: User) => {
    setUser(user);
  };

  const updateActiveWorkspace = async (workspace: Workspace) => {
    if (user) {
      const updateRes = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          active_workspace: workspace.id,
        }),
      });
      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        if (updatedUser.active_workspace !== user.active_workspace) {
          setUser(updatedUser);
          setActiveWorkspace(workspace);
        }
      } else {
        console.error('Error updating user active_workspace');
      }
    } else {
      console.log('no user to update');
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen">
        {/* Sidebar with header and list of workspaces */}
        {user && user.email && (
          <Sidebar
            workspaces={workspaces}
            userEmail={user.email}
            activeWorkspace={activeWorkspace}
            setActiveWorkspace={updateActiveWorkspace}
          />
        )}

        <div className="flex flex-col flex-1">
          {/* Page header */}
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

          {/* Main content */}
          <main className="flex-1 bg-gray-100"></main>
        </div>
      </div>

      {/* Modal for user settings */}
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
