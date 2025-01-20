import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BlockUpdate = {
  id: number;
  position: number;
};

export async function PUT(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const workflowId = parseInt(params.workflowId, 10);

    // Validate workflowId
    if (isNaN(workflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflow ID' },
        { status: 400 }
      );
    }

    const updatedPositions: BlockUpdate[] = await request.json();

    // Validate input
    if (
      !Array.isArray(updatedPositions) ||
      updatedPositions.some(
        (block) =>
          typeof block.id !== 'number' || typeof block.position !== 'number'
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid input. Expected an array of objects with numeric id and position.',
        },
        { status: 400 }
      );
    }

    // Update block positions in a transaction
    const result = await prisma.$transaction(
      updatedPositions.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { position: block.position },
        })
      )
    );

    return NextResponse.json({
      message: 'Blocks reordered successfully',
      updatedBlocks: result,
    });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
