import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
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
    const path = await prisma.path.create({
      data: {
        name,
        workflow_id,
      },
    });

    // Create default blocks (BEGIN, STEP, END)
    await prisma.block.createMany({
      data: [
        {
          type: 'BEGIN',
          position: 0,
          workflow_id,
          path_id: path.id,
          step_details: 'Begin',
          icon: '/step-icons/default-icons/begin.svg',
          description: 'Start of the workflow',
        },
        {
          type: 'STEP',
          position: 1,
          workflow_id,
          path_id: path.id,
          step_details: 'Default step details',
          icon: '/step-icons/default-icons/container.svg',
          description: 'This is a default block',
        },
        {
          type: 'LAST',
          position: 2,
          workflow_id,
          path_id: path.id,
          step_details: 'End',
          icon: '/step-icons/default-icons/end.svg',
          description: 'End of the workflow',
        },
      ],
    });

    // Return the path with its blocks
    const pathWithBlocks = await prisma.path.findUnique({
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
  }
} 