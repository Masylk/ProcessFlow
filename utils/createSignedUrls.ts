import { supabase } from '@/lib/supabaseClient';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

export async function createSignedUrls(path: any) {
    if (!BUCKET_NAME) {
      throw new Error('Bucket name is not defined in the environment variables');
    }
    if (!path?.blocks || !Array.isArray(path.blocks)) return path;

  // Map blocks to promises for signed URLs
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
 * Creates signed URLs for the image and icon of a single block.
 * - Skips icon if it's a Brandfetch CDN URL.
 * - Signed URLs are valid for 24 hours (86400 seconds).
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
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(block.image, 86400);
    if (!error && data?.signedUrl) {
      updatedBlock.signedImageUrl = data.signedUrl;
    }
  }

  // For block.icon, skip if it's a Brandfetch CDN URL
  if (
    block.icon &&
    !block.icon.startsWith('https://cdn.brandfetch.io/')
  ) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(block.icon, 86400);
    if (!error && data?.signedUrl) {
      updatedBlock.signedIconUrl = data.signedUrl;
    }
  }

  return updatedBlock;
} 