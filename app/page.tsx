'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { env } from 'process';

interface Workspace {
  id: number;
  name: string;
  teamTags: string[];
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatarURL?: string;
  created?: string;
}

function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  // 🔹 Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user');
      const data = await res.json();

      if (data.error) {
        console.error('Error fetching user:', data.error);
      } else {
        setUser(data);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Fetch workspaces when user is set
  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async () => {
        const res = await fetch(`/api/workspaces/${user.id}`);
        const data = await res.json();

        if (data.error) {
          console.error('Error fetching workspaces:', data.error);
        } else {
          setWorkspaces(data);
        }
      };

      fetchWorkspaces();
    }
  }, [user]);

  // 🔹 Add a new workspace
  const addWorkspace = async () => {
    if (!user) return;

    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWorkspaceName,
        user_id: parseInt(user.id),
      }),
    });

    const newWorkspace: Workspace = await response.json();
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
  };

  // 🔹 Handle user logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold">Home</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          Log out
        </button>
      </header>

      <main className="p-4">
        {user ? (
          <p className="text-lg font-bold">Hello, {user.email}</p>
        ) : (
          <p>Loading user info...</p>
        )}

        

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Add a new workspace</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Workspace Name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addWorkspace}
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Add Workspace
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;

