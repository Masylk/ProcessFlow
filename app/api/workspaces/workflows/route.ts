// app/api/workspaces/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspaces/workflows:
 *   post:
 *     summary: Create a new workflow
 *     description: Creates a new workflow within a workspace, optionally inside a folder.
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
 *                 example: "New Workflow"
 *               description:
 *                 type: string
 *                 example: "This is a new workflow"
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *               folder_id:
 *                 type: integer
 *                 example: 2
 *               team_tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["teamA", "teamB"]
 *     responses:
 *       201:
 *         description: Workflow created successfully
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
 *                   example: "This is a new workflow"
 *                 workspace_id:
 *                   type: integer
 *                   example: 1
 *                 folder_id:
 *                   type: integer
 *                   example: 2
 *                 team_tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["teamA", "teamB"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add workflow"
 *
 *   put:
 *     summary: Update an existing workflow
 *     description: Updates an existing workflow with new values.
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Updated Workflow"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               folder_id:
 *                 type: integer
 *                 example: 2
 *               team_tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["teamA"]
 *     responses:
 *       200:
 *         description: Workflow updated successfully
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
 *                   example: "Updated Workflow"
 *                 description:
 *                   type: string
 *                   example: "Updated description"
 *                 folder_id:
 *                   type: integer
 *                   example: 2
 *                 team_tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["teamA"]
 *       400:
 *         description: Workflow ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workflow ID is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update workflow"
 *
 *   delete:
 *     summary: Delete a workflow and its related data
 *     description: Deletes a workflow and all related blocks and paths.
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workflowId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Workflow and related data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workflow and related data deleted successfully"
 *       400:
 *         description: Workflow ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workflow ID is required"
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workflow not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete workflow and related data"
 */
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description, // Added field for description
      workspace_id,
      folder_id = null, // Optional field for folder association
      team_tags = [], // Optional field for team tags
    } = await req.json();

    // Create the workflow
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description, // Include description in the workflow creation
        workspace_id: Number(workspace_id),
        folder_id: folder_id ? Number(folder_id) : null,
        team_tags,
      },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error: any) {
    console.error('Error adding workflow:', error);
    return NextResponse.json(
      { error: 'Failed to add workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      id, // ID of the workflow to update
      name,
      description, // Optional field for description
      folder_id = null, // Optional field for folder association
      team_tags = [], // Optional field for team tags
    } = await req.json();

    // Ensure the `id` is provided
    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Update the workflow
    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id: Number(id), // Ensure the ID is a number
      },
      data: {
        ...(name && { name }), // Update name if provided
        ...(description && { description }), // Update description if provided
        ...(folder_id !== null && {
          folder_id: folder_id ? Number(folder_id) : null,
        }), // Update folder_id if provided
        ...(team_tags && { team_tags }), // Update team_tags if provided
      },
    });

    return NextResponse.json(updatedWorkflow, { status: 200 });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { workflowId } = await req.json(); // Expecting the workflow ID in the request body

    // Ensure workflowId is provided
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all related deletions occur together
    await prisma.$transaction(async (prisma) => {
      // Delete all blocks related to the workflow
      await prisma.block.deleteMany({
        where: { workflow_id: Number(workflowId) },
      });

      // Delete all paths related to the workflow
      await prisma.path.deleteMany({
        where: { workflow_id: Number(workflowId) },
      });

      // Finally, delete the workflow itself
      await prisma.workflow.delete({
        where: {
          id: Number(workflowId),
        },
      });
    });

    return NextResponse.json(
      { message: 'Workflow and related data deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting workflow:', error);

    // Handle specific Prisma errors (e.g., if the workflow doesn't exist)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete workflow and related data' },
      { status: 500 }
    );
  }
}
