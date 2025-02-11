export async function updateLastOpened(workflowId: number) {
  try {
    const response = await fetch('/api/workflow/updateLastOpened', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workflowId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update last_opened: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating last_opened:', error);
    return null;
  }
}
