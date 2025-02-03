// File: /app/api/workspaces/subfolder-workflows/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, workspace_id, folder_id } = await req.json();

    // Create a new workflow inside a specific subfolder
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
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
