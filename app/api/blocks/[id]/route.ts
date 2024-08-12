import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  const { type, position, icon, description, workflowId } = await req.json();

  try {
    const updatedBlock = await prisma.block.update({
      where: { id: Number(id) },
      data: { type, position, icon, description, workflowId },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Failed to update block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  try {
    // Delete related records in a transaction
    await prisma.$transaction([
      prisma.pathBlock.deleteMany({ where: { blockId: Number(id) } }),
      prisma.stepBlock.deleteMany({ where: { blockId: Number(id) } }),
      prisma.delayBlock.deleteMany({ where: { blockId: Number(id) } }),
      prisma.block.delete({ where: { id: Number(id) } }),
    ]);

    // Return a response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
}
