import { Workflow } from '@/types/workflow';
import { checkWorkflowName } from './checkNames';

export async function updateWorkflow(
  id: number,
  updateData: Partial<Workflow>
): Promise<{ workflow: Workflow | null; error?: { title: string; description: string } }> {
  try {
    // Check name if it's being updated
    if (updateData.name) {
      const nameError = checkWorkflowName(updateData.name);
      if (nameError) {
        return {
          workflow: null,
          error: nameError
        };
      }
    }

    const response = await fetch(`/api/workspace/workflows`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updateData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        workflow: null,
        error: {
          title: 'Error Updating Workflow',
          description: errorData.error || 'Failed to update workflow'
        }
      };
    }

    const updatedWorkflow: Workflow = await response.json();
    return { workflow: updatedWorkflow };
  } catch (error) {
    console.error('Error calling update workflow API:', error);
    return {
      workflow: null,
      error: {
        title: 'Error Updating Workflow',
        description: 'An unexpected error occurred'
      }
    };
  }
}
