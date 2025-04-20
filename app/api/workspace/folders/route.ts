// app/api/workspace/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
 *               team_tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tag1", "tag2"]
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
 *                 team_tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["tag1", "tag2"]
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
  try {
    const { name, workspace_id, team_tags, icon_url, emote } = await req.json();

    // Validate folder name
    const nameError = checkFolderName(name);
    if (nameError) {
      return NextResponse.json({ 
        error: 'Invalid folder name',
        ...nameError 
      }, { status: 400 });
    }

    // Create a new folder with no parent (top-level)
    const newFolder = await prisma.folder.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        team_tags: team_tags || [],
        icon_url: icon_url,
        emote: emote,
        parent_id: null,
      },
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error adding folder:', error);
    return NextResponse.json(
      { error: 'Failed to add folder' },
      { status: 500 }
    );
  }
}
