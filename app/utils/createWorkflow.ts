import { Workflow } from '@/types/workflow'; // Update the path to match your project structure

export async function createWorkflow(
  name: string,
  description: string,
  workspaceId: number,
  folderId: number | null = null,
  teamTags: string[] = [],
  authorId: number,
  icon: string | null = null,
): Promise<{ workflow: Workflow | null; error?: { title: string; description: string } }> {
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
        author_id: authorId,
        icon: icon,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return error details for toast notification
      return {
        workflow: null,
        error: {
          title: data.title || 'Error Creating Workflow',
          description: data.description || data.error || 'Failed to create workflow'
        }
      };
    }

    return { workflow: data };
  } catch (error) {
    console.error('Error creating workflow:', error);
    return {
      workflow: null,
      error: {
        title: 'Error Creating Workflow',
        description: 'An unexpected error occurred'
      }
    };
  }
}
