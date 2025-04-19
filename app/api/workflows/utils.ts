import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function generatePublicAccessId(
  workflowName: string,
  workflowId: number,
  workspaceId: number
): Promise<string> {
  const timestamp = Date.now();
  
  // Create a base string combining all elements
  const baseString = `${timestamp}-${workflowName}-${workflowId}-${workspaceId}`;
  
  // Generate a hash of the base string
  const hash = crypto.createHash('sha256').update(baseString).digest('hex');
  
  // Take first 12 characters of the hash and combine with a readable prefix
  const publicId = `${hash.substring(0, 12)}`;
  
  // Check if this ID already exists
  const existingWorkflow = await prisma.workflow.findFirst({
    where: {
      public_access_id: publicId,
    },
  });

  if (existingWorkflow) {
    // If ID exists, recursively try again
    return generatePublicAccessId(workflowName, workflowId, workspaceId);
  }

  console.log('Generated public access ID:', publicId);
  return publicId;
} 