import { Path } from '../../types';

interface CreateChildPathsResponse {
  paths: Path[];
}

/**
 * Creates minimal child paths and connects them to a parent block
 * @param pathNames Names for the new paths to create
 * @param workflowId ID of the workflow
 * @param parentPath The parent path to connect the new paths to
 * @returns Promise with the updated paths data
 */
export async function createChildPaths(
  pathNames: string[],
  workflowId: number,
  parentPath: Path
): Promise<CreateChildPathsResponse> {
  try {
    console.log('pathNames', pathNames);
    // Create minimal paths
    const createdPaths = await Promise.all(
      pathNames.map(async (name) => {
        const response = await fetch('/api/paths/minimal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            workflow_id: workflowId,
          }),
        });
        return response.json();
      })
    );

    // Connect paths to the parent path
    await fetch('/api/paths/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_path_ids: createdPaths.map((path) => path.id),
        destination_path_id: parentPath.id,
      }),
    });

    console.log('createdPaths', createdPaths);
    // Fetch updated paths data
    const pathsResponse = await fetch(
      `/api/workspace/${workflowId}/paths?workflow_id=${workflowId}`
    );
    
    if (!pathsResponse.ok) {
      throw new Error('Failed to fetch updated paths');
    }

    const pathsData = await pathsResponse.json();
    return { paths: pathsData.paths };
  } catch (error) {
    console.error('Error creating child paths:', error);
    throw error;
  }
} 