// app/api/workspace/[user_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { createSignedIconUrlsForWorkspaces } from '@/utils/createSignedUrls';

/**
 * @swagger
 * /api/workspace/{user_id}:
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
export async function GET(req: NextRequest, props: { params: Promise<{ user_id: string }> }) {
  const params = await props.params;
  const userId = parseInt(params.user_id); // Use the user_id from the URL

  const prisma_client = isVercel() ? new PrismaClient() : prisma;

  try {
    // Fetch user's workspaces with all necessary relations
    console.time('prisma.user_workspace.findMany');
    const userWorkspaces = await prisma_client.user_workspace.findMany({
      where: {
        user_id: userId,
      },
      include: {
        workspace: {
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
            user_workspaces: {
              include: {
                user: true,
              },
            },
            subscription: true,
          },
        },
      },
    });
    console.timeEnd('prisma.user_workspace.findMany');

    // Extract workspaces from the user_workspaces relation
    const workspaces = userWorkspaces.map(uw => uw.workspace);

    if (!workspaces || workspaces.length === 0) {
      // Définir une couleur de fond par défaut
      const defaultBackgroundColor = '#4299E1';

      // Create the default workspace and include folders (which will be empty)
      console.time('prisma.workspace.create');
      const newWorkspace = await prisma_client.workspace.create({
        data: {
          name: 'My Workspace',
          background_colour: defaultBackgroundColor,
          created_at: new Date(), // Date de création
          updated_at: new Date(), // Date de mise à jour
          user_workspaces: {
            create: {
              user_id: userId,
              role: 'ADMIN',
            },
          },
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
          user_workspaces: {
            include: {
              user: true,
            },
          },
          subscription: true,
        },
      });
      console.timeEnd('prisma.workspace.create');

      // Mettre à jour l'active_workspace_id de l'utilisateur
      console.time('prisma.user.update');
      await prisma_client.user.update({
        where: { id: userId },
        data: {
          active_workspace_id: newWorkspace.id,
        },
      });
      console.timeEnd('prisma.user.update');

      return NextResponse.json([newWorkspace]);
    }

    const workspacesWithSignedIcons = await createSignedIconUrlsForWorkspaces(workspaces);

    return NextResponse.json(workspacesWithSignedIcons);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
