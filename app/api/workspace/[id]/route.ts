// app/api/workspace/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { checkWorkspaceName } from '@/app/utils/checkNames';

/**
 * @swagger
 * /api/workspace/{id}:
 *   get:
 *     summary: Retrieve a workspace by its ID
 *     description: Fetches the details of a workspace, including related user information, workflows, blocks, and paths.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace
 *     responses:
 *       200:
 *         description: Successfully retrieved the workspace
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
 *                   example: "Workspace Name"
 *                 user_workspaces:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                 workflows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Workflow Name"
 *                       blocks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             position:
 *                               type: integer
 *                               example: 1
 *                       paths:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Path Name"
 *       400:
 *         description: Workspace ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workspace ID is required"
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
 *                   example: "Internal server error"
 *   patch:
 *     summary: Update a workspace
 *     description: Updates a workspace's properties (e.g., name, icon_url, etc.).
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Workspace"
 *               icon_url:
 *                 type: string
 *                 example: "/path/to/icon.svg"
 *               background_colour:
 *                 type: string
 *                 example: "#4299E1"
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a workspace
 *     description: Deletes a workspace and all associated data (folders, workflows, etc.)
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace to delete
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  if (!id) {
    return NextResponse.json(
      { error: 'Workspace ID is required' },
      { status: 400 }
    );
  }

  try {
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: parseInt(id) },
      include: {
        user_workspaces: {
          include: {
            user: true, // Include the user related to the workspace
          },
        },
        workflows: {
          include: {
            blocks: true,
            paths: true,
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

    return NextResponse.json(workspace, { status: 200 });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const workspaceId = parseInt(params.id);
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const updates = await req.json();

    const nameError = checkWorkspaceName(updates.name);
    if (nameError) {
      return NextResponse.json({ 
        error: 'Invalid workspace name',
        ...nameError 
      }, { status: 400 });
    }
    // Check if workspace exists
    const existingWorkspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!existingWorkspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Update workspace and include all related data in the response
    const updatedWorkspace = await prisma_client.workspace.update({
      where: { id: workspaceId },
      data: updates,
      include: {
        user_workspaces: {
          include: {
            user: true,
          },
        },
        workflows: {
          include: {
            blocks: true,
            paths: true,
          },
        },
        folders: true,
      },
    });

    return NextResponse.json(updatedWorkspace, { status: 200 });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const params = await props.params;
    const workspaceId = parseInt(params.id);

    // Check if workspace exists
    const existingWorkspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!existingWorkspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // First, update any users who have this as their active workspace
    await prisma_client.user.updateMany({
      where: { active_workspace_id: workspaceId },
      data: { active_workspace_id: null },
    });

    // Delete all user_workspace associations
    await prisma_client.user_workspace.deleteMany({
      where: { workspace_id: workspaceId },
    });

    // Delete all workflows in this workspace
    // First, delete all blocks and paths associated with workflows
    const workflowsInWorkspace = await prisma_client.workflow.findMany({
      where: { workspace_id: workspaceId },
      select: { id: true },
    });

    const workflowIds = workflowsInWorkspace.map(w => w.id);

    // Delete blocks
    await prisma_client.block.deleteMany({
      where: { workflow_id: { in: workflowIds } },
    });

    // Delete paths
    await prisma_client.path.deleteMany({
      where: { workflow_id: { in: workflowIds } },
    });

    // Delete workflows
    await prisma_client.workflow.deleteMany({
      where: { workspace_id: workspaceId },
    });

    // Delete all folders in this workspace
    await prisma_client.folder.deleteMany({
      where: { workspace_id: workspaceId },
    });

    // Finally, delete the workspace itself
    await prisma_client.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
