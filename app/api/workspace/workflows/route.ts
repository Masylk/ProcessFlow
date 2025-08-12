// app/api/workspace/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getActiveUser } from '@/lib/auth';
import { checkAndScheduleProcessLimitEmail } from '@/lib/emails/scheduleProcessLimitEmail';
import { generatePublicAccessId } from '../../workflow/utils';
import { checkWorkflowName } from '@/app/utils/checkNames';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { deleteFile } from '@/app/api/utils/deleteFile';

/**
 * @swagger
 * /api/workspace/workflows:
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
 *               icon:
 *                 type: string
 *                 example: "https://example.com/icon.png"
 *               status:
 *                 type: string
 *                 example: "active"
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
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const {
      name,
      description,
      process_owner,
      review_date,
      additional_notes,
      workspace_id,
      folder_id = null,
      author_id,
      icon = null,
    } = await req.json();

    // Validate required fields
    if (!name || !workspace_id) {
      return NextResponse.json(
        { error: 'Name and workspace_id are required' },
        { status: 400 }
      );
    }

    // Use the checkWorkflowName utility
    const nameError = checkWorkflowName(name);
    if (nameError) {
      return NextResponse.json(
        { 
          error: 'Invalid workflow name',
          ...nameError
        },
        { status: 400 }
      );
    }

    // Clean whitespaces in name
    const cleanedName = name.trim().replace(/\s+/g, ' ');

    // Convert review_date to proper DateTime format
    let sanitizedReviewDate = null;
    if (review_date && review_date !== '') {
      try {
        // If it's just a date (YYYY-MM-DD), convert to full DateTime
        const dateObj = new Date(review_date);
        if (!isNaN(dateObj.getTime())) {
          // Convert to ISO string for Prisma
          sanitizedReviewDate = dateObj.toISOString();
        }
      } catch (error) {
        console.error('Error parsing review_date:', error);
        // Leave as null if parsing fails
      }
    }

    // Get workspace with subscription info and workflow count
    const workspace = await prisma_client.workspace.findUnique({
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('Workspace details:', {
        id: workspace.id,
        subscription: workspace.subscription,
        workflowCount: workspace.workflows.length,
        isFreePlan: !workspace.subscription || workspace.subscription.plan_type === 'FREE',
      });
    }

    // Check if workspace is on free plan and has reached the limit
    const isFreePlan = !workspace.subscription || workspace.subscription.plan_type === 'FREE';
    const hasReachedLimit = workspace.workflows.length >= 5;

    if (isFreePlan && hasReachedLimit) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Blocking workflow creation: Free plan limit reached', {
          isFreePlan,
          workflowCount: workspace.workflows.length,
        });
      }
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('Creating workflow with author_id:', author_id, typeof author_id);
    }
    // Create the workflow with cleaned name
    const workflow = await prisma_client.workflow.create({
      data: {
        name: cleanedName,
        description,
        process_owner,
        review_date: sanitizedReviewDate,
        additional_notes,
        workspace_id,
        folder_id,
        is_public: true,
        author_id: author_id ? Number(author_id) : null,
        icon,
        public_access_id: await generatePublicAccessId(cleanedName, 0, workspace_id),
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // --- NEW LOGIC: Create a path and default blocks for the new workflow ---
    // Create a new path affiliated with this workflow
    const newPath = await prisma_client.path.create({
      data: {
        name: 'First Path',
        workflow_id: workflow.id,
      }
    });

    // Create BEGIN block
    await prisma_client.block.create({
      data: {
        type: 'BEGIN',
        position: 0,
        icon: '/step-icons/default-icons/begin.svg',
        description: '',
        workflow: { connect: { id: workflow.id } },
        path: { connect: { id: newPath.id } },
      }
    });

    // Create default STEP block
    await prisma_client.block.create({
      data: {
        type: 'STEP',
        position: 1,
        icon: '/step-icons/default-icons/container.svg',
        description: '',
        workflow: { connect: { id: workflow.id } },
        path: { connect: { id: newPath.id } },
      }
    });

    // Create END block
    await prisma_client.block.create({
      data: {
        type: 'LAST',
        position: 2,
        icon: '/step-icons/default-icons/end.svg',
        description: '',
        workflow: { connect: { id: workflow.id } },
        path: { connect: { id: newPath.id } },
      }
    });
    // --- END NEW LOGIC ---

    // If we need to update the public_access_id with the actual workflow ID
    const updatedPublicId = await generatePublicAccessId(
      workflow.name,
      workflow.id,
      workflow.workspace_id
    );

    // Update the workflow with the final public_access_id
    const updatedWorkflow = await prisma_client.workflow.update({
      where: { id: workflow.id },
      data: { public_access_id: updatedPublicId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Check if we should send a process limit reached email
    // We only want to send this when they've EXACTLY reached the limit (5 workflows)
    try {
      // After creating the workflow, get the current count
      const currentCount = await prisma_client.workflow.count({
        where: { workspace_id: Number(workspace_id) }
      });
      
      // Get the user ID from the workspace members
      const workspaceUsers = await prisma_client.user_workspace.findMany({
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

    return NextResponse.json(updatedWorkflow, { status: 201 });
  } catch (error: any) {
    console.error('Error adding workflow:', error);
    return NextResponse.json(
      { error: 'Failed to add workflow' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

export async function PUT(req: NextRequest) {

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const {
      id,
      name,
      description,
      process_owner,
      review_date,
      additional_notes,
      folder_id = null,
      icon = null,
      status = null,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Fetch the existing workflow to check the previous icon
    let previousIcon: string | null = null;
    if (icon !== undefined) {
      const existingWorkflow = await prisma_client.workflow.findUnique({
        where: { id: Number(id) },
        select: { icon: true },
      });
      previousIcon = existingWorkflow?.icon || null;
      // If previous icon exists, is different, and matches the pattern, delete it
      if (
        previousIcon &&
        previousIcon !== icon &&
        ((previousIcon.includes('uploads/') && previousIcon.includes('icons/')) || previousIcon.includes('step-icons/custom'))
      ) {
        await deleteFile(previousIcon);
      }
    }

    // Add name validation if name is being updated
    if (name) {
      const nameError = checkWorkflowName(name);
      if (nameError) {
        return NextResponse.json(
          { 
            error: 'Invalid workflow name',
            ...nameError
          },
          { status: 400 }
        );
      }
    }

    // Convert review_date to proper DateTime format if provided
    let sanitizedReviewDate = undefined;
    if (review_date !== undefined) {
      if (review_date === '' || review_date === null) {
        sanitizedReviewDate = null;
      } else {
        try {
          const dateObj = new Date(review_date);
          if (!isNaN(dateObj.getTime())) {
            sanitizedReviewDate = dateObj.toISOString();
          }
        } catch (error) {
          console.error('Error parsing review_date:', error);
        }
      }
    }

    const updatedWorkflow = await prisma_client.workflow.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(name && { name: name.trim().replace(/\s+/g, ' ') }),
        ...(description !== undefined && { description }),
        ...(process_owner !== undefined && { process_owner }),
        ...(sanitizedReviewDate !== undefined && { review_date: sanitizedReviewDate }),
        ...(additional_notes !== undefined && { additional_notes }),
        ...(folder_id !== null && {
          folder_id: folder_id ? Number(folder_id) : null,
        }),
        ...(icon !== undefined && { icon }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedWorkflow, { status: 200 });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function DELETE(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { workflowId } = await req.json(); // Expecting the workflow ID in the request body

    // Ensure workflowId is provided
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // --- Delete all block files from storage before deleting blocks ---
    // Fetch all blocks for the workflow
    const blocks = await prisma_client.block.findMany({
      where: { workflow_id: Number(workflowId) },
      select: { image: true, original_image: true, icon: true },
    });
    for (const block of blocks) {
      // Delete image if exists
      if (block.image) {
        await deleteFile(block.image);
      }
      // Delete original_image if exists
      if (block.original_image) {
        await deleteFile(block.original_image);
      }
      // Delete icon if matches the pattern
      if (
        block.icon &&
        ((block.icon.includes('uploads/') && block.icon.includes('icons/')) || block.icon.includes('step-icons/custom'))
      ) {
        await deleteFile(block.icon);
      }
    }

    // --- Delete workflow icon from storage if it matches the pattern ---
    const workflow = await prisma_client.workflow.findUnique({
      where: { id: Number(workflowId) },
      select: { icon: true },
    });
    if (
      workflow?.icon &&
      ((workflow.icon.includes('uploads/') && workflow.icon.includes('icons/')) || workflow.icon.includes('step-icons/custom'))
    ) {
      await deleteFile(workflow.icon);
    }

    // Start a transaction to ensure all related deletions occur together
    await prisma_client.$transaction(async (prisma) => {
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
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}
