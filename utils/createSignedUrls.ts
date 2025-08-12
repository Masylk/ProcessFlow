import { generatePublicUrl } from '@/app/api/utils/generatePublicUrl';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

export async function createSignedUrls(path: any) {
    if (!BUCKET_NAME) {
      throw new Error('Bucket name is not defined in the environment variables');
    }
    if (!path?.blocks || !Array.isArray(path.blocks)) return path;

  // Map blocks to promises for public URLs
  const updatedBlocks = await Promise.all(
    path.blocks.map(async (block: any) => {
      return await createSignedUrlForBlock(block);
    })
  );

  return {
    ...path,
    blocks: updatedBlocks,
  };
}

/**
 * Creates public URLs for the image and icon of a single block.
 * - Skips icon if it's a Brandfetch CDN URL.
 * @param block The block object to process.
 * @returns The block object with signedImageUrl and/or signedIconUrl if applicable.
 */
export async function createSignedUrlForBlock(block: any) {
  if (!BUCKET_NAME) {
    throw new Error('Bucket name is not defined in the environment variables');
  }
  const updatedBlock = { ...block };

  // For block.image
  if (block.image) {
    try {
      updatedBlock.signedImageUrl = generatePublicUrl(block.image);
    } catch (error) {
      console.error('Error generating public URL for block image:', error);
    }
  }

  // For block.icon, skip if it's a Brandfetch CDN URL
  if (
    block.icon &&
    !block.icon.startsWith('https://cdn.brandfetch.io/')
  ) {
    try {
      updatedBlock.signedIconUrl = generatePublicUrl(block.icon);
    } catch (error) {
      console.error('Error generating public URL for block icon:', error);
    }
  }

  return updatedBlock;
}

/**
 * For each workspace, go through each workflow and each folder and create a signedIconUrl for each of their icon_url.
 * - Skips icon_url if it's a Brandfetch CDN URL.
 * @param workspaces Array of workspace objects (as returned by the API)
 * @returns Updated array of workspaces with signedIconUrl fields
 */
export async function createSignedIconUrlsForWorkspaces(workspaces: any[]) {
  if (!BUCKET_NAME) {
    throw new Error('Bucket name is not defined in the environment variables');
  }
  if (!Array.isArray(workspaces)) return workspaces;

  // Helper to sign a single icon_url
  const signIconUrl = async (icon_url: string | null | undefined) => {
    if (
      !icon_url ||
      icon_url.startsWith('https://cdn.brandfetch.io/')
    ) {
      return icon_url; // Return as is (or null/undefined)
    }
    try {
      return generatePublicUrl(icon_url);
    } catch (error) {
      console.error('Error generating public URL for icon:', error);
      return icon_url;
    }
  };

  // Deep copy and process
  const updatedWorkspaces = await Promise.all(
    workspaces.map(async (workspace) => {
      // Clone workspace to avoid mutating input
      const updatedWorkspace = { ...workspace };

      // Process folders
      if (Array.isArray(updatedWorkspace.folders)) {
        updatedWorkspace.folders = await Promise.all(
          updatedWorkspace.folders.map(async (folder: any) => {
            if (folder.icon_url) {
              const signed = await signIconUrl(folder.icon_url);
              return { ...folder, signedIconUrl: signed };
            }
            return folder;
          })
        );
      }

      // Process workflows
      if (Array.isArray(updatedWorkspace.workflows)) {
        updatedWorkspace.workflows = await Promise.all(
          updatedWorkspace.workflows.map(async (workflow: any) => {
            if (workflow.icon) {
              const signed = await signIconUrl(workflow.icon);
              return { ...workflow, signedIconUrl: signed };
            }
            return workflow;
          })
        );
      }

      return updatedWorkspace;
    })
  );

  return updatedWorkspaces;
} 