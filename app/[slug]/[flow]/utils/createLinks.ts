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

export const createAndCopyShareLink = (name: string, public_access_id: string) => {
  const shareUrl = createShareLink(name, public_access_id);
  if (shareUrl) {
    navigator.clipboard.writeText(shareUrl);
    return true;
  }
  return false;
};
