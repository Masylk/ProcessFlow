import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/workspace/folders/update-position:
 *   post:
 *     summary: Update folder position and/or parent
 *     description: Updates a folder's position and/or changes its parent
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folderId:
 *                 type: integer
 *                 example: 1
 *               newParentId:
 *                 type: integer
 *                 example: 2
 *               newPosition:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Folder position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Folder position updated successfully"
 *                 folder:
 *                   type: object
 *       404:
 *         description: Folder not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Folder not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { folderId, newParentId, newPosition } = await req.json();

    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Check if folder exists
    const folder = await prisma_client.folder.findUnique({
      where: { id: Number(folderId) },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Get the workspace ID from the folder
    const workspaceId = folder.workspace_id;

    // Get all folders in the same group (same parent) to reorder them
    const isFolderMovingToNewParent = folder.parent_id !== newParentId;
    
    // Find siblings of the target position (folders with the same parent)
    const siblingFolders = await prisma_client.folder.findMany({
      where: {
        workspace_id: workspaceId,
        parent_id: newParentId === undefined ? folder.parent_id : newParentId,
        id: { not: Number(folderId) }, // Exclude the folder being moved
      },
      orderBy: { position: 'asc' },
    });
    
    // Update all positions in a transaction to ensure consistency
    const updatedFolder = await prisma_client.$transaction(async (tx) => {
      // If folder is moving to a new parent, just update its parent and position
      if (isFolderMovingToNewParent) {
        // If moving to a new parent, shift all siblings in the new parent whose position
        // is greater than or equal to the new position
        if (newParentId !== null) {
          await tx.folder.updateMany({
            where: {
              workspace_id: workspaceId,
              parent_id: newParentId,
              position: { gte: newPosition },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }

        // Update the moved folder's parent and position
        return await tx.folder.update({
          where: { id: Number(folderId) },
          data: {
            parent_id: newParentId === null ? null : Number(newParentId),
            position: newPosition !== undefined ? Number(newPosition) : 0,
          },
        });
      } else {
        // If folder is staying in the same parent but changing position
        const oldPosition = folder.position;
        const targetPosition = Number(newPosition);

        // Reorder siblings based on whether we're moving up or down
        if (targetPosition < oldPosition) {
          // Moving up: Increment positions of folders between target and old position
          await tx.folder.updateMany({
            where: {
              workspace_id: workspaceId,
              parent_id: folder.parent_id,
              id: { not: Number(folderId) },
              position: { gte: targetPosition, lt: oldPosition },
            },
            data: {
              position: { increment: 1 },
            },
          });
        } else if (targetPosition > oldPosition) {
          // Moving down: Decrement positions of folders between old and target position
          await tx.folder.updateMany({
            where: {
              workspace_id: workspaceId,
              parent_id: folder.parent_id,
              id: { not: Number(folderId) },
              position: { gt: oldPosition, lte: targetPosition },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else {
          // Position didn't change, do nothing
          return folder;
        }

        // Update the moved folder's position
        return await tx.folder.update({
          where: { id: Number(folderId) },
          data: {
            position: targetPosition,
          },
        });
      }
    });

    return NextResponse.json({
      message: 'Folder position updated successfully',
      folder: updatedFolder,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating folder position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 