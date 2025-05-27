// app/api/workspace/folders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { checkFolderName } from '@/app/utils/checkNames';

/**
 * DELETE /api/workspace/folders/:id
 * Deletes a folder by ID
 */
/**
 * @swagger
 * /api/workspace/folders/{id}:
 *   delete:
 *     summary: Delete a folder by ID
 *     description: Deletes a folder with the specified ID.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the folder to delete
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Folder deleted successfully"
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
 *   patch:
 *     summary: Update a folder by ID
 *     description: Updates a folder's properties (e.g., name, icon_url, emote, etc.) with the specified ID.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the folder to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Folder"
 *               icon_url:
 *                 type: string
 *                 example: "/path/to/icon.svg"
 *               emote:
 *                 type: string
 *                 example: ":smile:"
 *               parent_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Folder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Updated Folder"
 *                 icon_url:
 *                   type: string
 *                   example: "/path/to/icon.svg"
 *                 emote:
 *                   type: string
 *                   example: ":smile:"
 *                 parent_id:
 *                   type: integer
 *                   example: 2
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
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const folderId = Number(params.id);
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Parse body for parent_id and workspace_id
    const { parent_id, workspace_id } = await req.json();

    // Check if folder exists
    const folder = await prisma_client.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete folder
    await prisma_client.folder.delete({
      where: { id: folderId },
    });

    // Update positions of siblings with higher position
    await prisma_client.folder.updateMany({
      where: {
        workspace_id: Number(workspace_id),
        parent_id: parent_id === null ? null : Number(parent_id),
        position: { gt: folder.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return NextResponse.json(
      { message: 'Folder deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workspace/folders/:id
 * Updates a folder by ID
 */
/**
 * PATCH /api/workspace/folders/:id
 * Updates a folder by ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const folderId = Number(params.id);

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { name, icon_url, emote, parent_id } = await req.json();

    // Check if folder exists
    const existingFolder = await prisma_client.folder.findUnique({
      where: { id: folderId },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Validate folder name if it's being updated
    if (name) {
      const nameError = checkFolderName(name);
      if (nameError) {
        return NextResponse.json({ 
          error: 'Invalid folder name',
          ...nameError 
        }, { status: 400 });
      }
    }

    // Ensure icon_url and emote are explicitly set to null if undefined
    const updateData: Record<string, any> = {
      name,
      icon_url: icon_url ?? null,
      emote: emote ?? null,
      parent_id,
    };

    // Update folder
    const updatedFolder = await prisma_client.folder.update({
      where: { id: folderId },
      data: updateData,
    });

    return NextResponse.json(updatedFolder, { status: 200 });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
