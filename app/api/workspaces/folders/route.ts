// File: /app/api/workspaces/folders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, workspace_id, team_tags } = await req.json();

    // Create a new folder with no parent (top-level)
    const newFolder = await prisma.folder.create({
      data: {
        name,
        workspace_id: Number(workspace_id),
        team_tags: team_tags || [],
        parent_id: null,
      },
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error adding folder:', error);
    return NextResponse.json(
      { error: 'Failed to add folder' },
      { status: 500 }
    );
  }
}
