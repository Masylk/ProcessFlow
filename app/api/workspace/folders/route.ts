// app/api/workspace/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { checkFolderName } from '@/app/utils/checkNames';

/**
 * @swagger
 * /api/workspace/folders:
 *   post:
 *     summary: Create a new folder
 *     description: Creates a new folder within a workspace. The folder will be created at the top-level (no parent).
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Folder"
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *               icon_url:
 *                 type: string
 *                 example: "/path/to/icon.svg"
 *               emote:
 *                 type: string
 *                 example: ":smile:"
 *     responses:
 *       201:
 *         description: Folder created successfully
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
 *                   example: "New Folder"
 *                 workspace_id:
 *                   type: integer
 *                   example: 1
 *                 icon_url:
 *                   type: string
 *                   example: "/path/to/icon.svg"
 *                 emote:
 *                   type: string
 *                   example: ":smile:"
 *                 parent_id:
 *                   type: integer
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add folder"
 */
export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { name, workspace_id, icon_url, emote, position } = await req.json();

    // Validate folder name
    const nameError = checkFolderName(name);
    if (nameError) {
      return NextResponse.json({ 
        error: 'Invalid folder name',
        ...nameError 
      }, { status: 400 });
    }

    // Create a new folder with no parent (top-level)
    const newFolder = await prisma_client.folder.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        icon_url: icon_url,
        emote: emote,
        parent_id: null,
        position: position ? Number(position) : 0,
      },
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error adding folder:', error);
    return NextResponse.json(
      { error: 'Failed to add folder' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
