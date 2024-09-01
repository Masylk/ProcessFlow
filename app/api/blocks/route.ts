import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const {
    type,
    position,
    icon,
    description,
    workflowId,
    delayBlock,
    stepBlock,
    pathBlock,
  } = await req.json();

  if (!['DELAY', 'STEP', 'PATH'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid block type. Expected DELAY, STEP, or PATH.' },
      { status: 400 }
    );
  }

  try {
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

      // Prepare the data object for block creation
      const blockData: any = {
        type,
        position,
        icon,
        description,
        workflowId,
      };

      // Add the specific block data based on the type
      if (type === 'DELAY') {
        blockData.delayBlock = { create: { delay: delayBlock.delay } };
      } else if (type === 'STEP') {
        blockData.stepBlock = {
          create: { stepDetails: stepBlock.stepDetails },
        };
      } else if (type === 'PATH') {
        blockData.pathBlock = {
          create: {
            pathOptions: {
              create: pathBlock.pathOptions.map((option: string) => ({
                pathOption: option,
              })),
            },
          },
        };
      }

      // Create the new block and associated specific block
      const newBlock = await prisma.block.create({
        data: blockData,
        include: {
          delayBlock: type === 'DELAY',
          stepBlock: type === 'STEP',
          pathBlock: {
            include: {
              pathOptions: true,
            },
          },
        },
      });

      return newBlock;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}
