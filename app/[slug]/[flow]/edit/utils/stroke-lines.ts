import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface StrokeLineData {
  source_block_id: number;
  target_block_id: number;
  workflow_id: number;
  label: string;
  is_loop?: boolean;
  control_points?: Point[];
}

interface UpdateStrokeLineData extends StrokeLineData {
  id: number;
}

/**
 * Creates a new stroke line connection between blocks
 * @param data The stroke line data to create
 * @returns The created stroke line or null if creation failed
 */
export const addStrokeLine = async (data: StrokeLineData) => {
  try {
    const response = await fetch('/api/stroke-lines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to create stroke line');
      return null;
    }

    const strokeLine = await response.json();
    toast.success('Stroke line created successfully');
    return strokeLine;
  } catch (error) {
    console.error('Error creating stroke line:', error);
    toast.error('Failed to create stroke line');
    return null;
  }
};

/**
 * Updates an existing stroke line
 * @param data The stroke line data to update, including the ID
 * @returns The updated stroke line or null if update failed
 */
export const updateStrokeLine = async (data: UpdateStrokeLineData) => {
  try {
    const response = await fetch('/api/stroke-lines', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to update stroke line');
      return null;
    }

    const updatedStrokeLine = await response.json();
    toast.success('Stroke line updated successfully');
    return updatedStrokeLine;
  } catch (error) {
    console.error('Error updating stroke line:', error);
    toast.error('Failed to update stroke line');
    return null;
  }
};

/**
 * Deletes a stroke line by its ID
 * @param id The ID of the stroke line to delete
 * @returns true if deletion was successful, false otherwise
 */
export const deleteStrokeLine = async (id: number) => {
  try {
    const response = await fetch(`/api/stroke-lines?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to delete stroke line');
      return false;
    }

    toast.success('Stroke line deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting stroke line:', error);
    toast.error('Failed to delete stroke line');
    return false;
  }
};

/**
 * Fetches all stroke lines for a specific workflow
 * @param workflowId The ID of the workflow
 * @returns Array of stroke lines or null if fetch failed
 */
export const getWorkflowStrokeLines = async (workflowId: number) => {
  try {
    const response = await fetch(`/api/stroke-lines?workflow_id=${workflowId}`);

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to fetch stroke lines');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stroke lines:', error);
    toast.error('Failed to fetch stroke lines');
    return null;
  }
};

/**
 * Updates control points for a stroke line
 * @param id The ID of the stroke line
 * @param controlPoints Array of control points with x,y coordinates
 * @returns The updated stroke line or null if update failed
 */
export const updateStrokeLineControlPoints = async (id: number, controlPoints: Point[]) => {
  try {
    const response = await fetch(`/api/stroke-lines?id=${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        control_points: controlPoints,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update control points:', errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating control points:', error);
    return null;
  }
}; 