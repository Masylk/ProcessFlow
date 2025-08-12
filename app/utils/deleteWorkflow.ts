export async function deleteWorkflow(workflowId: number): Promise<boolean> {
  try {
    const response = await fetch('/api/workspace/workflows', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workflowId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        'Failed to delete workflow:',
        errorData.error || 'Unknown error'
      );
      return false; // Deletion unsuccessful
    }

   
    return true; // Deletion successful
  } catch (error) {
    console.error('Error calling delete workflow API:', error);
    return false; // Deletion unsuccessful
  }
}
