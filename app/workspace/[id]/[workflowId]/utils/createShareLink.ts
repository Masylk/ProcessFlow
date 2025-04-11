import { WorkflowData } from "../types";

export const createShareLink = (name: string, public_access_id: string) => {
  if (!name || !public_access_id) {
    console.log('no workflow', name, public_access_id);
    return;
    }
    console.log('workflow copy link', name, public_access_id);
    // Format the workflow name (replace spaces with underscores)
    const formattedName = name.replace(/\s+/g, '-');

    // Create the share URL
    const shareUrl = `${window.location.origin}/shared/${formattedName}--pf-${public_access_id}`;

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
