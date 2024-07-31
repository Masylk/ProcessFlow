'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import WorkflowList from '@/app/components/WorkflowList';

interface Workflow {
  id: number;
  name: string;
  workspaceId: number;
}

export default function WorkspacePage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWorkflowName, setNewWorkflowName] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetch(`/api/workspace/${id}/workflows`)
        .then((res) => res.json())
        .then((data) => setWorkflows(data));
    }
  }, [id]);

  const addWorkflow = async () => {
    if (!id) return;

    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newWorkflowName,
        workspaceId: parseInt(id as string),
      }),
    });

    const newWorkflow: Workflow = await response.json();
    setWorkflows([...workflows, newWorkflow]);
    setNewWorkflowName('');
  };

  return (
    <div>
      <WorkflowList workflows={workflows} workspaceId={id as string} />
      <div>
        <h2>Add a new workflow</h2>
        <input
          type="text"
          placeholder="Workflow Name"
          value={newWorkflowName}
          onChange={(e) => setNewWorkflowName(e.target.value)}
        />
        <button onClick={addWorkflow}>Add Workflow</button>
      </div>
    </div>
  );
}
