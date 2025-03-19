// app/api/workspaces/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getActiveUser } from '@/lib/auth';
import { checkAndScheduleProcessLimitEmail } from '@/lib/emails/scheduleProcessLimitEmail';

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
    // For now, just proceed without trying to get the user 
    // This allows workflow creation to work again
    const {
      name,
      description,
      workspace_id,
      folder_id = null,
      team_tags = [],
    } = await req.json();

    // Get workspace with subscription info and workflow count
    const workspace = await prisma.workspace.findUnique({
      where: { id: Number(workspace_id) },
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

    // Log workspace details for debugging
    console.log('Workspace details:', {
      id: workspace.id,
      subscription: workspace.subscription,
      workflowCount: workspace.workflows.length,
      isFreePlan: !workspace.subscription || workspace.subscription.plan_type === 'FREE',
    });

    // Check if workspace is on free plan and has reached the limit
    const isFreePlan = !workspace.subscription || workspace.subscription.plan_type === 'FREE';
    const hasReachedLimit = workspace.workflows.length >= 5;

    if (isFreePlan && hasReachedLimit) {
      console.log('Blocking workflow creation: Free plan limit reached', {
        isFreePlan,
        workflowCount: workspace.workflows.length,
      });
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

    // Create the workflow
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description,
        workspace_id: Number(workspace_id),
        folder_id: folder_id ? Number(folder_id) : null,
        team_tags,
      },
    });

    // Check if we should send a process limit reached email
    // We only want to send this when they've EXACTLY reached the limit (5 workflows)
    try {
      // After creating the workflow, get the current count
      const currentCount = await prisma.workflow.count({
        where: { workspace_id: Number(workspace_id) }
      });
      
      // Get the user ID from the workspace members
      const workspaceUsers = await prisma.user_workspace.findMany({
        where: { workspace_id: Number(workspace_id) },
        select: {
          user_id: true,
          role: true,
        },
        orderBy: { role: 'asc' }, // This should put admins first
      });
      
      if (workspaceUsers.length > 0) {
        const userId = workspaceUsers[0].user_id;
        
        // Only send the email if they've exactly reached the limit (5) and are on the free plan
        if (isFreePlan && currentCount === 5) {
          await checkAndScheduleProcessLimitEmail(userId);
        }
      }
    } catch (emailError) {
      // Just log the error, but don't block the workflow creation
      console.error('Error checking workflow limit for email:', emailError);
    }

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
