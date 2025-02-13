'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import WorkspaceList from './components/WorskpaceList';

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
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔹 Detect email change confirmation
  useEffect(() => {
    const type = searchParams.get('type');

    if (type === 'email_change') {
      setAlertMessage('Your email has been successfully changed!');

      // Remove query params from URL after showing the message
      const params = new URLSearchParams(searchParams.toString());
      params.delete('type');
      params.delete('token');
      params.delete('redirect_to');

      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

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
        {alertMessage && (
          <div className="mb-4 p-4 text-white bg-green-500 rounded-lg shadow-md">
            {alertMessage}
          </div>
        )}

        {user ? (
          <p className="text-lg font-bold">Hello, {user.email}</p>
        ) : (
          <p>Loading user info...</p>
        )}

        <WorkspaceList workspaces={workspaces} />
      </main>
    </div>
  );
}

export default HomePage;
