import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, description, workspace_id, folder_id } = await req.json();

    // Ensure all required fields are provided
    if (!name || !description || !workspace_id || !folder_id) {
      return NextResponse.json(
        {
          error: 'Name, description, workspace_id, and folder_id are required',
        },
        { status: 400 }
      );
    }

    // Create a new workflow inside a specific subfolder
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description, // Include the required description field
        workspace_id: Number(workspace_id),
        folder_id: Number(folder_id),
      },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error adding workflow to subfolder:', error);
    return NextResponse.json(
      { error: 'Failed to add workflow to subfolder' },
      { status: 500 }
    );
  }
}
