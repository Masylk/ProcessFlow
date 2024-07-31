'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import WorkspaceList from '@/app/components/WorskpaceList';

interface Workspace {
  id: number;
  name: string;
  teamId: number;
}

function TeamPage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetch(`/api/team/${id}/workspaces`)
        .then((res) => res.json())
        .then((data) => setWorkspaces(data));
    }
  }, [id]);

  const addWorkspace = async () => {
    if (!id) return;

    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newWorkspaceName,
        teamId: parseInt(id as string),
      }),
    });

    const newWorkspace: Workspace = await response.json();
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
  };

  return (
    <div>
      <WorkspaceList workspaces={workspaces} />
      <div>
        <h2>Add a new workspace</h2>
        <input
          type="text"
          placeholder="Workspace Name"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
        <button onClick={addWorkspace}>Add Workspace</button>
      </div>
    </div>
  );
}

export default TeamPage;
