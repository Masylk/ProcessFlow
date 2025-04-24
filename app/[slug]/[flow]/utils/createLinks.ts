import { WorkflowData } from "../types";

export const createShareLink = (name: string, public_access_id: string) => {
  if (!name || !public_access_id) return;
  const formattedName = name.replace(/\s+/g, '-');
  const shareUrl = `${window.location.origin}/shared/${formattedName}--pf-${public_access_id}`;
  return shareUrl;
};

export const createEditLink = (name: string, workflowId: string, slug: string) => {
  const formattedName = name.replace(/\s+/g, '-');
  const shareUrl = `${window.location.origin}/${slug}/${formattedName}--pf-${workflowId}/edit`;
  return shareUrl;
};

export const createReadLink = (name: string, workflowId: string, slug: string) => {
  const formattedName = name.replace(/\s+/g, '-');
  const shareUrl = `${window.location.origin}/${slug}/${formattedName}--pf-${workflowId}/read`;
  return shareUrl;
};

export const createAndCopyShareLink = async (workflowId: number | string) => {
  try {
    const response = await fetch(`/api/workflow/${workflowId}`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    
    const workflow = await response.json();
    const shareUrl = createShareLink(workflow.name, workflow.public_access_id);
    
    if (!shareUrl) throw new Error('Could not create share link');
    
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  } catch (error) {
    throw error;
  }
};
