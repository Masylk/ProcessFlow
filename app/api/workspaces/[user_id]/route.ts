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
  { params }: { params: { user_id: string } }
) {
  const userId = parseInt(params.user_id); // Use the user_id from the URL

  try {
    // Fetch the user and their workspaces (with folders and workflows included) based on user_id
    const user = await prisma.user.findUnique({
      where: {
        id: userId, // Query by user_id
      },
      include: {
        user_workspaces: {
          include: {
            workspace: {
              include: {
                folders: {
                  orderBy: {
                    id: 'asc', // Ensure consistent order (change to name or id if needed)
                  },
                },
                workflows: {
                  orderBy: {
                    id: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract workspaces from the user_workspaces relation
    const workspaces = user.user_workspaces.map((uw) => uw.workspace);

    // If no workspaces are found, create a default one named "My Workspace"
    if (!workspaces || workspaces.length === 0) {
      // Create the default workspace and include folders (which will be empty)
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
        },
        include: {
          folders: {
            orderBy: {
              id: 'asc',
            },
          },
          workflows: {
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

      // Create the relation linking the user with the new workspace.
      await prisma.user_workspace.create({
        data: {
          user_id: user.id,
          workspace_id: newWorkspace.id,
          role: 'ADMIN',
        },
      });

      // Return the newly created workspace inside an array for consistency.
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
