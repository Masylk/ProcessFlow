import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const {
    type,
    position,
    icon,
    delay,
    description,
    workflow_id,
    path_id,
    step_block,
    path_block,
    imageUrl,
    click_position,
  } = await req.json();

  // Validate block type
  if (!['STEP', 'PATH', 'DELAY'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid block type. Expected STEP, PATH, or DELAY.' },
      { status: 400 }
    );
  }

  if (!path_id) {
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
    const result = await prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        // Update positions of existing blocks in the specified path
        await prisma.block.updateMany({
          where: {
            workflow_id,
            path_id,
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
          workflow: { connect: { id: workflow_id } },
          path: { connect: { id: path_id } },
          click_position: click_position || null, // Set the click_position if provided
        };

        // Add specific block data based on the block type
        if (type === 'STEP' && step_block) {
          blockData.step_block = {
            create: {
              step_details: step_block.step_details,
            },
          };
        } else if (type === 'PATH' && path_block) {
          // Create paths and their default blocks
          blockData.path_block = {
            create: {
              paths: {
                create: path_block.pathOptions.map((option: string) => ({
                  name: option,
                  workflow: { connect: { id: workflow_id } },
                })),
              },
            },
          };
        } else if (type === 'DELAY') {
          // Use the delay value to create delay_block
          blockData.delay_block = {
            create: {
              seconds: delay, // Use the provided delay value
            },
          };
        }

        // Create the new block with its related data
        const newBlock = await prisma.block.create({
          data: blockData,
          include: {
            step_block: type === 'STEP',
            path_block: {
              include: {
                paths: true,
              },
            },
            delay_block: type === 'DELAY', // Include delay_block if DELAY type
          },
        });

        // Create default blocks inside each path created
        if (type === 'PATH' && newBlock.path_block?.paths?.length) {
          await Promise.all(
            newBlock.path_block.paths.map(async (path: { id: number }) => {
              const defaultBlockData: any = {
                type: 'STEP', // Default block type
                position: 0, // Default position
                icon: '/step-icons/default-icons/container.svg', // Default icon
                description: 'This is a default block', // Default description
                workflow: { connect: { id: workflow_id } },
                path: { connect: { id: path.id } },
                step_block: {
                  create: {
                    step_details: 'Default step details', // Default step details
                  },
                },
              };

              await prisma.block.create({
                data: defaultBlockData,
                include: {
                  step_block: true,
                },
              });
            })
          );
        }

        return newBlock;
      }
    );

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
