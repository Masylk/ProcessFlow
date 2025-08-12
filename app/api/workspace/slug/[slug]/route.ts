import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/workspace/slug/{slug}:
 *   get:
 *     summary: Get workspace by slug
 *     description: Retrieves workspace information by its slug identifier.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug identifier of the workspace
 *     responses:
 *       200:
 *         description: Successfully retrieved workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 name:
 *                   type: string
 *                   example: "My Workspace"
 *                 slug:
 *                   type: string
 *                   example: "my-workspace"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       403:
 *         description: User does not have access to this workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied to workspace"
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workspace not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve workspace"
 */
export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  const prismaClient = isVercel() ? new PrismaClient() : prisma;
  
  if (!prismaClient) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const workspace = await prismaClient.workspace.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        user_workspaces: {
          where: {
            user: {
              auth_id: userData.user.id,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (workspace.user_workspaces.length === 0) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });

  } catch (error) {
    console.error('Workspace slug API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workspace' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prismaClient.$disconnect();
  }
}