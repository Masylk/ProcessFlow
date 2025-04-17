import prisma from '@/lib/prisma';
import { IsFirstPath } from '../paths/Pathutils';
import { deleteFile } from '../deleteFile';

export async function deleteOneBlock(id: number | string) {
  // Find the block and its path
  const block = await prisma.block.findUnique({
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

  // Save workflow_id and position before deleting
  const workflowId = block.workflow_id;
  const pathId = block.path_id;
  const deletedPosition = block.position;

  // Delete only the image file from Supabase storage
  await deleteFile(imageUrl);

  // Delete the block (cascade will handle related records)
  await prisma.block.delete({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
  });

  // Decrement positions of blocks with position > deletedPosition
  await prisma.block.updateMany({
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
} 