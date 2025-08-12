import { Block } from "../../types";

/**
 * Toggle the is_endpoint property for a block, update state, and optionally call a backend.
 * @param blockId The ID of the block to update.
 * @param newValue The new value for is_endpoint.
 * @param allPaths The current array of all paths.
 * @param setAllPaths Function to update all paths.
 * @param onPathsUpdate Optional callback to update paths in parent.
 * @returns void
 */
export async function handleToggleEndpoint(
  blockId: number,
  newValue: boolean,
  allPaths: any[],
  setAllPaths: (paths: any[]) => void,
  onPathsUpdate?: (paths: any[]) => void
) {
  try {
    const response = await fetch(`/api/blocks/${blockId}/toggle-endpoint`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_endpoint: newValue }),
    });

    if (!response.ok) {
      throw new Error('Failed to update is_endpoint');
    }

    // Optionally, get the updated block from the response
    // const updatedBlock = await response.json();

    // Update local state only after successful backend update
    const updatedPaths = allPaths.map((path) => ({
      ...path,
      blocks: path.blocks.map((block: Block) =>
        block.id === blockId ? { ...block, is_endpoint: newValue } : block
      ),
    }));
    setAllPaths(updatedPaths);
    if (onPathsUpdate) onPathsUpdate(updatedPaths);
  } catch (error) {
    // Optionally: show error to user
    console.error('Failed to update is_endpoint:', error);
  }
}

