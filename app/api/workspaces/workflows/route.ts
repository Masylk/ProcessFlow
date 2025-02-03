// File: /app/api/workspaces/workflows/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, workspace_id } = await req.json();

    // Create a new workflow in the workspace (no folder)
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        folder_id: null,
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
