// File: /app/api/workspaces/subfolders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, workspace_id, parent_id, team_tags } = await req.json();

    // Create a new subfolder with the specified parent folder
    const newSubfolder = await prisma.folder.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        team_tags: team_tags || [],
        parent_id: parent_id ? Number(parent_id) : null,
      },
    });

    return NextResponse.json(newSubfolder, { status: 201 });
  } catch (error) {
    console.error('Error adding subfolder:', error);
    return NextResponse.json(
      { error: 'Failed to add subfolder' },
      { status: 500 }
    );
  }
}
