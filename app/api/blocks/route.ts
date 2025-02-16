import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /api/blocks:
 *   post:
 *     summary: Create a new block
 *     description: Creates a new block in the specified workflow and path. Supports STEP, PATH, and DELAY block types.
 *     tags:
 *       - Blocks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - position
 *               - workflow_id
 *               - path_id
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [STEP, PATH, DELAY]
 *                 description: The type of block to create.
 *               position:
 *                 type: integer
 *                 description: The position of the block within the path.
 *               icon:
 *                 type: string
 *                 nullable: true
 *                 description: URL or path to the block's icon.
 *               delay:
 *                 type: integer
 *                 nullable: true
 *                 description: Delay time in seconds (only for DELAY blocks).
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: A short description of the block.
 *               workflow_id:
 *                 type: integer
 *                 description: The ID of the workflow the block belongs to.
 *               path_id:
 *                 type: integer
 *                 description: The ID of the path the block belongs to.
 *               step_block:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   step_details:
 *                     type: string
 *                     description: Details for the STEP block.
 *               path_block:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   pathOptions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of new paths to create within the PATH block.
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL for an image associated with the block.
 *               click_position:
 *                 type: string
 *                 nullable: true
 *                 description: Position details related to the block.
 *     responses:
 *       201:
 *         description: Successfully created a block.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */
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
        await prisma.block.updateMany({
          where: { workflow_id, path_id, position: { gte: position } },
          data: { position: { increment: 1 } },
        });

        const blockData: any = {
          type,
          position,
          icon,
          description,
          image: imageUrl || null,
          workflow: { connect: { id: workflow_id } },
          path: { connect: { id: path_id } },
          click_position: click_position || null,
        };

        if (type === 'STEP' && step_block) {
          blockData.step_block = {
            create: { step_details: step_block.step_details },
          };
        } else if (type === 'PATH' && path_block) {
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
          blockData.delay_block = { create: { seconds: delay } };
        }

        const newBlock = await prisma.block.create({
          data: blockData,
          include: {
            step_block: type === 'STEP',
            path_block: { include: { paths: true } },
            delay_block: type === 'DELAY',
          },
        });

        if (type === 'PATH' && newBlock.path_block?.paths?.length) {
          await Promise.all(
            newBlock.path_block.paths.map(async (path: { id: number }) => {
              await prisma.block.create({
                data: {
                  type: 'STEP',
                  position: 0,
                  icon: '/step-icons/default-icons/container.svg',
                  description: 'This is a default block',
                  workflow: { connect: { id: workflow_id } },
                  path: { connect: { id: path.id } },
                  step_block: {
                    create: { step_details: 'Default step details' },
                  },
                },
                include: { step_block: true },
              });
            })
          );
        }

        return newBlock;
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}
