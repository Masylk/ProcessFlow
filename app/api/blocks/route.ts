import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { type, position, icon, description, workflowId } = await req.json();

  // Start a transaction to ensure all operations are atomic
  const result = await prisma.$transaction(async (prisma) => {
    // Update positions of existing blocks
    await prisma.block.updateMany({
      where: {
        workflowId,
        position: {
          gte: position,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });

    // Create the new block
    const newBlock = await prisma.block.create({
      data: {
        type,
        position,
        icon,
        description,
        workflowId,
      },
    });

    return newBlock;
  });

  return NextResponse.json(result);
}
