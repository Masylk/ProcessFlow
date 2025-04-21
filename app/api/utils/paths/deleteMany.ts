import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

/**
 * Recursively deletes paths, their blocks, and associated images from storage.
 * @param pathIds Array of path IDs to delete
 */
export async function deleteManyPaths(pathIds: number[]): Promise<void> {
  if (!Array.isArray(pathIds) || pathIds.length === 0) return;

  // Fetch all paths with their blocks and child_paths
  const paths = await prisma.path.findMany({
    where: { id: { in: pathIds } },
    select: {
      id: true,
      blocks: {
        select: {
          id: true,
          child_paths: {
            select: {
              path_id: true,
            },
          },
          image: true,
        },
      },
    },
  });

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

  for (const path of paths) {
    for (const block of path.blocks) {
      // Delete image from storage if exists
      if (bucketName && block.image) {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([block.image]);
        if (error) {
          console.error(`Error deleting image for block ${block.id}:`, error);
        }
      }

      // Recursively delete child paths if any
      if (block.child_paths && block.child_paths.length > 0) {
        const childPathIds = block.child_paths.map((cp: any) => cp.path_id);
        await deleteManyPaths(childPathIds);
      }
    }

    // Delete the path itself
    await prisma.path.delete({
      where: { id: path.id },
    });

  }
}
