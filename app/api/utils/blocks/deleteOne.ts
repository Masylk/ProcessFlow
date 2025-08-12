import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { IsFirstPath } from '../paths/Pathutils';
import { deleteFile } from '../deleteFile';

export async function deleteOneBlock(id: number | string) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Find the block and its path
    const block = await prisma_client.block.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      include: {
        child_paths: true
      }
    });

    if (!block) {
      return { error: 'Block not found', status: 404 };
    }

    // If block is BEGIN and its path is the first path, do not delete
    if (block.type === 'BEGIN' && block.path_id) {
      const isFirst = await IsFirstPath(block.path_id);
      if (isFirst) {
        return { error: 'Cannot delete BEGIN block of the first path', status: 400 };
      }
    }

    const imageUrl = block.image;
    const originalImageUrl = block.original_image;
    const iconUrl = block.icon;

    // Save workflow_id and position before deleting
    const workflowId = block.workflow_id;
    const pathId = block.path_id;
    const deletedPosition = block.position;

    // Delete only the image, original image, and icon files from Supabase storage
    await deleteFile(imageUrl);
    await deleteFile(originalImageUrl);
    if (iconUrl && (iconUrl.includes('uploads/') && iconUrl.includes('icons/') || iconUrl.includes('step-icons/custom'))) {
      await deleteFile(iconUrl);
    }

    // Delete the block (cascade will handle related records)
    await prisma_client.block.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    });

    // Decrement positions of blocks with position > deletedPosition
    await prisma_client.block.updateMany({
      where: {
        workflow_id: workflowId,
        path_id: pathId,
        position: { gt: deletedPosition }
      },
      data: {
        position: { decrement: 1 }
      }
    });

    return { status: 204 };
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 