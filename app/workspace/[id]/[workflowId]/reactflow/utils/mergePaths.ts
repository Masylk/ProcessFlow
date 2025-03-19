import { Path } from '../types';

export async function mergePaths(paths: Path[], workflowId: number) {
  try {
    // Create merge path and parent relationships in a single transaction
    const response = await fetch('/api/paths/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Merge',
        workflow_id: workflowId,
        parent_blocks: paths.map(path => {
          const endBlock = path.blocks.find(block => 
            block.type === 'END' || block.type === 'LAST'
          );
          return endBlock?.id;
        }).filter(Boolean),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create merge path');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error merging paths:', error);
    throw error;
  }
} 