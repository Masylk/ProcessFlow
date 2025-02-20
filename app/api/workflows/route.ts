// app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workflows:
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
  const { name, description, workspaceId } = await req.json();

  // Ensure both `name` and `description` are provided
  if (!name || !description) {
    return NextResponse.json(
      { error: 'Name and description are required' },
      { status: 400 }
    );
  }

  try {
    // Create a new workflow
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description, // Include the required description field
        workspace: {
          connect: { id: workspaceId }, // Use the `connect` syntax to link the workspace
        },
      },
    });

    return NextResponse.json(newWorkflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
