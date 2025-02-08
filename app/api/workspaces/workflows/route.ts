import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function DELETE(req: NextRequest) {
  try {
    const { workflowId } = await req.json(); // Expecting the workflow ID in the request body

    console.log('trying to delete');
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
