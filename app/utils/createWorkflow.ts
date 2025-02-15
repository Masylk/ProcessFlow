import { Workflow } from '@/types/workflow'; // Update the path to match your project structure

export async function createWorkflow(
  name: string,
  description: string,
  workspaceId: number,
  folderId: number | null = null,
  teamTags: string[] = []
): Promise<Workflow | null> {
  try {
    const response = await fetch('/api/workspaces/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        workspace_id: workspaceId,
        folder_id: folderId,
        team_tags: teamTags,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create workflow');
    }

    const newWorkflow: Workflow = await response.json();
    return newWorkflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    return null;
  }
}
