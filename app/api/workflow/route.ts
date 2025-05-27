import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/workflow:
 *   post:
 *     summary: Create a new workflow
 *     description: Creates a new workflow within a specified workspace.
 *     tags:
 *       - Workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - workspaceId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Workflow"
 *               description:
 *                 type: string
 *                 example: "This is a description of the workflow."
 *               workspaceId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully created a new workflow.
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
 *                   example: "New Workflow"
 *                 description:
 *                   type: string
 *                   example: "This is a description of the workflow."
 *                 workspaceId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Name and description are required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create workflow"
 */
export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const { name, description, workspaceId } = await req.json();

    // Ensure both `name` and `description` are provided
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Get workspace with subscription info and workflow count
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: true,
        workflows: {
          select: { id: true },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if workspace is on free plan and has reached the limit
    const isFreePlan = !workspace.subscription || workspace.subscription.plan_type === 'FREE';
    const hasReachedLimit = workspace.workflows.length >= 5;

    if (isFreePlan && hasReachedLimit) {
      return NextResponse.json(
        {
          error: 'Free plan is limited to 5 workflows',
          title: 'Workflow Limit Reached',
          description: 'Your free plan is limited to 5 workflows. Upgrade to create more workflows.',
          status: 403
        },
        { status: 403 }
      );
    }

    // Create a new workflow
    const newWorkflow = await prisma_client.workflow.create({
      data: {
        name,
        description,
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });

    return NextResponse.json(newWorkflow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 