import { WorkflowData } from "../types";

// Utility to sanitize workflow names for URLs
const sanitizeName = (name: string) =>
  name.replace(/\s+/g, '-');

export const createShareLink = (name: string, public_access_id: string) => {
  if (!name || !public_access_id) return;
  const sanitizedName = sanitizeName(name);
  const shareUrl = `${window.location.origin}/shared/${sanitizedName}--pf-${public_access_id}`;
  return shareUrl;
};

export const createEditLink = (name: string, workflowId: string, slug: string) => {
  const sanitizedName = sanitizeName(name);
  const shareUrl = `${window.location.origin}/${slug}/${sanitizedName}--pf-${workflowId}/edit`;
  return shareUrl;
};

export const createReadLink = (name: string, workflowId: string, slug: string) => {
  const sanitizedName = sanitizeName(name);
  const shareUrl = `${window.location.origin}/${slug}/${sanitizedName}--pf-${workflowId}/read`;
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
