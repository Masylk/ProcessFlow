import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  try {
    const blockId = Number(id);

    // Fetch the block to determine its type
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        pathBlock: true,
        stepBlock: true,
        delayBlock: true,
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    await prisma.$transaction(async (prisma) => {
      // Delete related records based on block type
      if (block.type === 'PATH' && block.pathBlock) {
        // Delete all path options associated with this path block
        await prisma.pathOption.deleteMany({
          where: { pathBlockId: block.pathBlock.id },
        });

        // Delete the path block itself
        await prisma.pathBlock.delete({
          where: { id: block.pathBlock.id },
        });
      } else if (block.type === 'STEP' && block.stepBlock) {
        // Delete the step block
        await prisma.stepBlock.delete({
          where: { id: block.stepBlock.id },
        });
      } else if (block.type === 'DELAY' && block.delayBlock) {
        // Delete the delay block
        await prisma.delayBlock.delete({
          where: { id: block.delayBlock.id },
        });
      }

      // Finally, delete the block itself
      await prisma.block.delete({
        where: { id: blockId },
      });
    });

    // Return a response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to delete block:', error.message);
      return NextResponse.json(
        { error: `Failed to delete block: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('Failed to delete block:', error);
      return NextResponse.json(
        { error: 'Failed to delete block: unknown error' },
        { status: 500 }
      );
    }
  }
}
