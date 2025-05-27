import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface UpdateMergePathRequest {
  parents_to_connect: number[];
  parents_to_disconnect: number[];
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const params = await props.params;
    const { id } = params;
    const mergePathId = parseInt(id);
    
    const { parents_to_connect, parents_to_disconnect } = await req.json();

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma_client.$transaction(async (tx) => {
      // Delete specified relationships
      if (parents_to_disconnect.length > 0) {
        await tx.path_parent_block.deleteMany({
          where: {
            path_id: mergePathId,
            block_id: {
              in: parents_to_disconnect
            }
          }
        });

        // For each disconnected block, check if it has no more child paths
        for (const blockId of parents_to_disconnect) {
          const block = await tx.block.findUnique({
            where: { id: blockId },
            include: { child_paths: true }
          });

          if (block && 
              block.child_paths.length === 0 && 
              block.type !== 'LAST' && 
              block.type !== 'END') {
            await tx.block.update({
              where: { id: blockId },
              data: { type: 'LAST' }
            });
          }
        }
      }

      // Create new relationships
      if (parents_to_connect.length > 0) {
        await tx.path_parent_block.createMany({
          data: parents_to_connect.map((blockId: number) => ({
            path_id: mergePathId,
            block_id: blockId,
          })),
          skipDuplicates: true,
        });

        // Update connected blocks to type 'MERGE'
        await tx.block.updateMany({
          where: {
            id: {
              in: parents_to_connect
            }
          },
          data: { type: 'MERGE' }
        });
      }

      // Check if path has any parent blocks left
      const updatedPath = await tx.path.findUnique({
        where: { id: mergePathId },
        include: {
          blocks: true,
          parent_blocks: true,
        },
      });

      // If no parent blocks remain, delete the path and its blocks
      if (updatedPath && updatedPath.parent_blocks.length === 0) {
        // Delete all blocks in the path
        await tx.block.deleteMany({
          where: {
            path_id: mergePathId
          }
        });

        // Delete the path itself
        await tx.path.delete({
          where: {
            id: mergePathId
          }
        });

        return null; // Indicate path was deleted
      }

      return updatedPath;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating merge path:', error);
    return NextResponse.json(
      { error: 'Failed to update merge path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 