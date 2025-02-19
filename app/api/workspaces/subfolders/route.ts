// app/api/workspaces/subfolders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspaces/subfolders:
 *   post:
 *     summary: Create a new subfolder within a workspace
 *     description: Creates a new subfolder within a workspace, optionally inside a parent folder.
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
 *                 example: "New Subfolder"
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *               parent_id:
 *                 type: integer
 *                 example: 2
 *               team_tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["teamA", "teamB"]
 *               icon_url:
 *                 type: string
 *                 example: "https://example.com/icon.png"
 *               emote:
 *                 type: string
 *                 example: "😊"
 *     responses:
 *       201:
 *         description: Subfolder created successfully
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
 *                   example: "New Subfolder"
 *                 workspace_id:
 *                   type: integer
 *                   example: 1
 *                 parent_id:
 *                   type: integer
 *                   example: 2
 *                 team_tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["teamA", "teamB"]
 *                 icon_url:
 *                   type: string
 *                   example: "https://example.com/icon.png"
 *                 emote:
 *                   type: string
 *                   example: "😊"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add subfolder"
 */
export async function POST(req: NextRequest) {
  try {
    const { name, workspace_id, parent_id, team_tags, icon_url, emote } =
      await req.json();

    // Create a new subfolder with the specified parent folder
    const newSubfolder = await prisma.folder.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        team_tags: team_tags || [],
        icon_url: icon_url,
        emote: emote,
        parent_id: parent_id ? Number(parent_id) : null,
      },
    });

    return NextResponse.json(newSubfolder, { status: 201 });
  } catch (error) {
    console.error('Error adding subfolder:', error);
    return NextResponse.json(
      { error: 'Failed to add subfolder' },
      { status: 500 }
    );
  }
}
