import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const {
    type,
    position,
    icon,
    delay,
    description,
    workflowId,
    pathId,
    stepBlock,
    pathBlock,
    imageUrl,
    clickPosition,
  } = await req.json();

  // Validate block type
  if (!['STEP', 'PATH', 'DELAY'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid block type. Expected STEP, PATH, or DELAY.' },
      { status: 400 }
    );
  }

  if (!pathId) {
    return NextResponse.json(
      { error: 'Path ID is required to create a block.' },
      { status: 400 }
    );
  }

  // Validate delay for DELAY type
  if (type === 'DELAY' && (delay === undefined || delay < 0)) {
    return NextResponse.json(
      {
        error:
          'A valid delay value (non-negative number) is required for DELAY blocks.',
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Update positions of existing blocks in the specified path
      await prisma.block.updateMany({
        where: {
          workflowId,
          pathId,
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
        image: imageUrl || null, // Set the image field if imageUrl is provided
        workflow: { connect: { id: workflowId } },
        path: { connect: { id: pathId } },
        clickPosition: clickPosition || null, // Set the clickPosition if provided
      };

      // Add specific block data based on the block type
      if (type === 'STEP' && stepBlock) {
        blockData.stepBlock = {
          create: {
            stepDetails: stepBlock.stepDetails,
          },
        };
      } else if (type === 'PATH' && pathBlock) {
        // Create paths and their default blocks
        blockData.pathBlock = {
          create: {
            paths: {
              create: pathBlock.pathOptions.map((option: string) => ({
                name: option,
                workflow: { connect: { id: workflowId } },
              })),
            },
          },
        };
      } else if (type === 'DELAY') {
        // Use the delay value to create DelayBlock
        blockData.delayBlock = {
          create: {
            seconds: delay, // Use the provided delay value
          },
        };
      }

      // Create the new block with its related data
      const newBlock = await prisma.block.create({
        data: blockData,
        include: {
          stepBlock: type === 'STEP',
          pathBlock: {
            include: {
              paths: true,
            },
          },
          delayBlock: type === 'DELAY', // Include DelayBlock if DELAY type
        },
      });

      // Create default blocks inside each path created
      if (type === 'PATH' && newBlock.pathBlock?.paths?.length) {
        await Promise.all(
          newBlock.pathBlock.paths.map(async (path) => {
            const defaultBlockData: any = {
              type: 'STEP', // Default block type
              position: 0, // Default position
              icon: '/step-icons/default-icons/container.svg', // Default icon
              description: 'This is a default block', // Default description
              workflow: { connect: { id: workflowId } },
              path: { connect: { id: path.id } },
              stepBlock: {
                create: {
                  stepDetails: 'Default step details', // Default step details
                },
              },
            };

            await prisma.block.create({
              data: defaultBlockData,
              include: {
                stepBlock: true,
              },
            });
          })
        );
      }

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
