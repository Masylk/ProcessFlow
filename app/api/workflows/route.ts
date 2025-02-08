import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
