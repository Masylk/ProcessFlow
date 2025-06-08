import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface CreateTestWorkspaceRequest {
  userId: number;
  workspaceName?: string;
  workspaceSlug?: string;
}

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const { userId, workspaceName = 'Test Workspace', workspaceSlug = 'test-workspace' }: CreateTestWorkspaceRequest = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma_client.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create workspace with unique slug
    let uniqueSlug = workspaceSlug;
    let counter = 1;
    
    while (true) {
      const existingWorkspace = await prisma_client.workspace.findUnique({
        where: { slug: uniqueSlug }
      });
      
      if (!existingWorkspace) break;
      
      uniqueSlug = `${workspaceSlug}-${counter}`;
      counter++;
    }

    // Create the workspace
    const workspace = await prisma_client.workspace.create({
      data: {
        name: workspaceName,
        slug: uniqueSlug,
        icon_url: '🏢',
        background_colour: '#ffffff'
      }
    });

    // Create user_workspace relationship
    await prisma_client.user_workspace.create({
      data: {
        user_id: userId,
        workspace_id: workspace.id,
        role: 'ADMIN'
      }
    });

    // Update user's active workspace if they don't have one
    if (!user.active_workspace_id) {
      await prisma_client.user.update({
        where: { id: userId },
        data: { active_workspace_id: workspace.id }
      });
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug
      }
    });

  } catch (error) {
    console.error('Error creating test workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create test workspace' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}