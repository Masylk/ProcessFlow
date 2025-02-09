import { Workflow } from '@/types/workflow';

export async function updateWorkflow(
  id: number,
  updateData: Partial<Workflow>
): Promise<Workflow | null> {
  try {
    const response = await fetch(`/api/workspaces/workflows`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updateData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        'Failed to update workflow:',
        errorData.error || 'Unknown error'
      );
      return null; // Update unsuccessful
    }

    const updatedWorkflow: Workflow = await response.json();
    console.log('Workflow updated successfully:', updatedWorkflow);
    return updatedWorkflow; // Return the updated workflow
  } catch (error) {
    console.error('Error calling update workflow API:', error);
    return null; // Update unsuccessful
  }
}
