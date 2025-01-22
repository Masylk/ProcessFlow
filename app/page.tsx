'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import WorkspaceList from '@/app/components/WorskpaceList';

interface Workspace {
  id: number;
  name: string;
  teamId: number;
}

function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');
  const [newWorkspaceTeamId, setNewWorkspaceTeamId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/workspaces')
      .then((res) => res.json())
      .then((data) => setWorkspaces(data));
  }, []);

  const addWorkspace = async () => {
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newWorkspaceName,
        teamId: parseInt(newWorkspaceTeamId),
      }),
    });

    const newWorkspace: Workspace = await response.json();
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
    setNewWorkspaceTeamId('');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Successfully logged out');
      window.location.href = '/login'; // Redirect to login page
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
        <WorkspaceList workspaces={workspaces} />
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
            <input
              type="number"
              placeholder="Team ID"
              value={newWorkspaceTeamId}
              onChange={(e) => setNewWorkspaceTeamId(e.target.value)}
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
