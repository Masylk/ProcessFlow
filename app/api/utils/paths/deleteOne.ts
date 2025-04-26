import prisma from '@/lib/prisma';
import { deleteOneBlock } from '../blocks/deleteOne';
import { deleteManyPaths } from './deleteMany';

export async function deleteOnePath(id: number | string) {
  const pathId = typeof id === 'string' ? parseInt(id, 10) : id;

  // Get parent blocks of the path
  const parentBlocks = await prisma.path_parent_block.findMany({
    where: { path_id: pathId },
    select: { block_id: true },
  });

  // Only perform the child_paths check if there is exactly one parent block
  if (parentBlocks.length === 1) {
    const parentBlockId = parentBlocks[0].block_id;
    const childPaths = await prisma.path_parent_block.findMany({
      where: { block_id: parentBlockId },
      select: { path_id: true },
    });

    // If deleting this path would leave only one child path, abort
    if (childPaths.length === 2) {
      throw new Error(
        'Cannot delete this path: its parent block would be left with only one child path.'
      );
    }
  }

  // Proceed with deletion
  await prisma.path_parent_block.deleteMany({
    where: { path_id: pathId },
  });

  // Delete each block in the path using deleteOneBlock
  const blocks = await prisma.block.findMany({
    where: { path_id: pathId },
    select: { id: true, child_paths: { select: { path_id: true } } },
  });
  for (const block of blocks) {
    if (block.child_paths.length > 0) {
      const pathIds = block.child_paths.map((path) => path.path_id);
      await deleteManyPaths(pathIds);
    }
    await deleteOneBlock(block.id);
  }

  return prisma.path.delete({
    where: { id: pathId },
  });
} 