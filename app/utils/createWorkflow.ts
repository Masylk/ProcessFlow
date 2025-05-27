import { Workflow } from '@/types/workflow'; // Update the path to match your project structure
import { checkWorkflowName } from './checkNames';

interface CreateWorkflowParams {
  name: string;
  description: string;
  process_owner?: string;
  review_date?: string;
  additional_notes?: string;
  workspaceId: number;
  folderId?: number | null;
  teamTags?: string[];
  authorId?: number;
  icon?: string | null;
}

export async function createWorkflow({
  name,
  description,
  process_owner,
  review_date,
  additional_notes,
  workspaceId,
  folderId,
  teamTags,
  authorId,
  icon,
}: CreateWorkflowParams): Promise<{ workflow: Workflow | null; error?: { title: string; description: string } }> {
  try {
    // Validate name using the new utility function
    const nameError = checkWorkflowName(name);
    if (nameError) {
      return {
        workflow: null,
        error: nameError
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('process_owner', process_owner);
      console.log('review_date', review_date);
      console.log('additional_notes', additional_notes);
    }
    
    // Sanitize review_date: send null if empty string or undefined
    const sanitizedReviewDate =
      review_date === '' || review_date === undefined ? null : review_date;

    const response = await fetch('/api/workspace/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        process_owner: process_owner,
        review_date: sanitizedReviewDate,
        additional_notes: additional_notes,
        workspace_id: workspaceId,
        folder_id: folderId,
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
