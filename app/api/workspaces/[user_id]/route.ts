// app/api/workspaces/[user_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspaces/{user_id}:
 *   get:
 *     summary: Retrieve all workspaces for a user
 *     description: Fetches the workspaces associated with a specific user, including related folders and workflows. If no workspaces are found, a default workspace named "My Workspace" is created.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "My Workspace"
 *                   folders:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Folder Name"
 *                   workflows:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Workflow Name"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function GET(
  req: NextRequest,
  context: { params: { user_id?: string } } // Ensure user_id is optional
) {
  // Destructure inside function body (ensuring `params` is resolved)
  const { params } = context;
  const userId = parseInt(params?.user_id ?? '0');

  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const userWorkspaces = await prisma.user_workspace.findMany({
      where: { user_id: userId },
      include: {
        workspace: {
          include: {
            folders: { orderBy: { id: 'asc' } },
            workflows: { orderBy: { id: 'asc' } },
            user_workspaces: { include: { user: true } },
          },
        },
      },
    });

    const workspaces = userWorkspaces.map((uw) => uw.workspace);

    if (!workspaces.length) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          background_colour: '#4299E1',
          team_tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          user_workspaces: {
            create: { user_id: userId, role: 'ADMIN' },
          },
        },
        include: {
          folders: { orderBy: { id: 'asc' } },
          workflows: { orderBy: { id: 'asc' } },
          user_workspaces: { include: { user: true } },
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { active_workspace_id: newWorkspace.id },
      });

      return NextResponse.json([newWorkspace]);
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
