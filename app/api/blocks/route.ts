import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const {
    type,
    position,
    icon,
    description,
    workflowId,
    pathId, // Ensure pathId is correctly passed and used
    delayBlock,
    stepBlock,
    pathBlock,
  } = await req.json();

  // Validate block type
  if (!['DELAY', 'STEP', 'PATH'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid block type. Expected DELAY, STEP, or PATH.' },
      { status: 400 }
    );
  }

  if (!pathId) {
    return NextResponse.json(
      { error: 'Path ID is required to create a block.' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Update positions of existing blocks in the specified path
      await prisma.block.updateMany({
        where: {
          workflowId,
          pathId, // Ensure updates are scoped within the path
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

      // Prepare the block data object for creation
      const blockData: any = {
        type,
        position,
        icon,
        description,
        workflow: { connect: { id: workflowId } }, // Correctly connect the workflow
        path: { connect: { id: pathId } }, // Link the block to the specific path
      };

      // Add specific block data based on the block type
      if (type === 'DELAY' && delayBlock) {
        blockData.delayBlock = {
          create: { delay: delayBlock.delay },
        };
      } else if (type === 'STEP' && stepBlock) {
        blockData.stepBlock = {
          create: { stepDetails: stepBlock.stepDetails },
        };
      } else if (type === 'PATH' && pathBlock) {
        blockData.pathBlock = {
          create: {
            paths: {
              create: pathBlock.pathOptions.map((option: string) => ({
                name: option, // Update to the correct field name in your schema
                workflow: { connect: { id: workflowId } }, // Ensure the path has a linked workflow
              })),
            },
          },
        };
      }

      // Create the new block with its related data
      const newBlock = await prisma.block.create({
        data: blockData,
        include: {
          delayBlock: type === 'DELAY',
          stepBlock: type === 'STEP',
          pathBlock: {
            include: {
              paths: true,
            },
          },
        },
      });

      return newBlock;
    });
    console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}
