import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';


export async function PATCH(request: NextRequest) {
  // Extract the block ID from the URL
  const { pathname } = request.nextUrl;
  const match = pathname.match(/\/blocks\/(\d+)\/toggle-endpoint/);
  const blockId = match ? Number(match[1]) : NaN;

  if (isNaN(blockId)) {
    return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 });
  }

  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Fetch the block with its path and all blocks in the path, ordered by position
    const block = await prisma_client.block.findUnique({
      where: { id: blockId },
      select: {
        id: true,
        is_endpoint: true,
        path_id: true,
        path: {
          select: {
            blocks: {
              select: { id: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Check if block is the source of any stroke lines (excluding self-referencing)
    const strokeLineCount = await prisma_client.stroke_line.count({
      where: {
        source_block_id: blockId,
      },
    });

    if (strokeLineCount === 0) {
      return NextResponse.json(
        { error: 'Block is not the source of any stroke lines.' },
        { status: 400 }
      );
    }

    const blocksInPath = block.path?.blocks ?? [];
    if (blocksInPath.length < 2) {
      return NextResponse.json(
        { error: 'Path does not have enough blocks to determine penultimate block.' },
        { status: 400 }
      );
    }

    // The penultimate block is at length - 2
    const penultimateBlock = blocksInPath[blocksInPath.length - 2];

    if (penultimateBlock.id !== blockId) {
      return NextResponse.json(
        { error: 'Block is not the penultimate block in its path.' },
        { status: 400 }
      );
    }

    // Toggle the is_endpoint value
    const updatedBlock = await prisma_client.block.update({
      where: { id: blockId },
      data: { is_endpoint: !block.is_endpoint },
    });

    return NextResponse.json(updatedBlock, { status: 200 });
  } catch (error) {
    console.error('Error toggling is_endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}
