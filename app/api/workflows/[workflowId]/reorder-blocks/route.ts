import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const workflowId = parseInt(params.workflowId, 10);
    const updatedPositions = await request.json();

    // Validate input
    if (!Array.isArray(updatedPositions) || updatedPositions.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
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
