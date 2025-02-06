// File: /app/api/workspaces/folders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/workspaces/folders/:id
 * Deletes a folder by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const folderId = Number(params.id);

  try {
    // Check if folder exists
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete folder
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json(
      { message: 'Folder deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workspaces/folders/:id
 * Updates a folder by ID
 */
/**
 * PATCH /api/workspaces/folders/:id
 * Updates a folder by ID
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const folderId = Number(params.id);

  try {
    const { name, icon_url, emote, team_tags, parent_id } = await req.json();

    // Check if folder exists
    const existingFolder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Ensure icon_url and emote are explicitly set to null if undefined
    const updateData: Record<string, any> = {
      name,
      icon_url: icon_url ?? null, // If undefined, set to null
      emote: emote ?? null, // If undefined, set to null
      team_tags,
      parent_id,
    };

    // Update folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: updateData,
    });

    return NextResponse.json(updatedFolder, { status: 200 });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
