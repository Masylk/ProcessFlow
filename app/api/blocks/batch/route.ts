import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { blocks, path_id, workflow_id } = await req.json();

    const createdBlocks = await prisma.block.createMany({
      data: blocks.map((block: any, index: number) => ({
        ...block,
        position: block.position || index,
        workflow_id,
        path_id,
      })),
    });

    return NextResponse.json(createdBlocks);
  } catch (error) {
    console.error('Error creating blocks:', error);
    return NextResponse.json(
      { error: 'Failed to create blocks' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { block_ids } = await req.json();

    await prisma.block.deleteMany({
      where: {
        id: {
          in: block_ids,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocks:', error);
    return NextResponse.json(
      { error: 'Failed to delete blocks' },
      { status: 500 }
    );
  }
} 