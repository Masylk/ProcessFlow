import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const body = await req.json();
    const { name, workflow_id } = body;

    if (!name || !workflow_id) {
      return NextResponse.json(
        { error: 'Name and workflow_id are required' },
        { status: 400 }
      );
    }

    // Create the path
    const path = await prisma_client.path.create({
      data: {
        name,
        workflow_id,
      },
    });

    // Create default blocks (BEGIN, STEP, END)
    await prisma_client.block.createMany({
      data: [
        {
          type: 'BEGIN',
          position: 0,
          workflow_id,
          path_id: path.id,
          icon: '/step-icons/default-icons/begin.svg',
          description: '',
        },
        {
          type: 'STEP',
          position: 1,
          workflow_id,
          path_id: path.id,
          icon: '/step-icons/default-icons/container.svg',
          description: '',
        },
        {
          type: 'LAST',
          position: 2,
          workflow_id,
          path_id: path.id,
          icon: '/step-icons/default-icons/end.svg',
          description: '',
        },
      ],
    });

    // Return the path with its blocks
    const pathWithBlocks = await prisma_client.path.findUnique({
      where: { id: path.id },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
        parent_blocks: true,
      },
    });

    return NextResponse.json(pathWithBlocks);
  } catch (error) {
    console.error('Error creating path:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to create path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function PATCH(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const updatedPath = await prisma_client.path.update({
      where: { id },
      data: { name },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
          include: {
            child_paths: {
              include: {
                path: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedPath);
  } catch (error) {
    console.error('Error updating path:', error);
    return NextResponse.json(
      { error: 'Failed to update path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 