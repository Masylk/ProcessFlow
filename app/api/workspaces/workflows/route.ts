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
  } catch (error) {
    console.error('Error adding workflow:', error);
    return NextResponse.json(
      { error: 'Failed to add workflow' },
      { status: 500 }
    );
  }
}
