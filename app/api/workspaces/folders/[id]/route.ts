// app/api/workspaces/folders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/workspaces/folders/:id
 * Deletes a folder by ID
 */
/**
 * @swagger
 * /api/workspaces/folders/{id}:
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
 *               team_tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "tag1"
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
 *                 team_tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["tag1", "tag2"]
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
  { params }: { params: { id: string } }
) {
  const folderId = Number(params.id);

  try {
    // Check if folder exists
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete folder
    await prisma.folder.delete({
      where: { id: folderId },
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
 * PATCH /api/workspaces/folders/:id
 * Updates a folder by ID
 */
/**
 * PATCH /api/workspaces/folders/:id
 * Updates a folder by ID
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const folderId = Number(params.id);

  try {
    const { name, icon_url, emote, team_tags, parent_id } = await req.json();

    // Check if folder exists
    const existingFolder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Ensure icon_url and emote are explicitly set to null if undefined
    const updateData: Record<string, any> = {
      name,
      icon_url: icon_url ?? null, // If undefined, set to null
      emote: emote ?? null, // If undefined, set to null
      team_tags,
      parent_id,
    };

    // Update folder
    const updatedFolder = await prisma.folder.update({
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
  }
}
