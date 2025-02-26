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
 *               delay_seconds:
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
 *               step_details:
 *                 type: string
 *                 nullable: true
 *                 description: Details for the STEP block.
 *               path_options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of new paths to create within the PATH block.
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
    delay_seconds,
    description,
    workflow_id,
    path_id,
    step_details,
    path_options,
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

  if (type === 'DELAY' && (delay_seconds === undefined || delay_seconds < 0)) {
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
      // Update positions of existing blocks
      await prisma.block.updateMany({
        where: { workflow_id, path_id, position: { gte: position } },
        data: { position: { increment: 1 } },
      });

      // Create the new block
      const blockData = {
        type,
        position,
        icon,
        description,
        image: imageUrl || null,
        workflow: { connect: { id: workflow_id } },
        path: { connect: { id: path_id } },
        click_position: click_position || null,
        step_details: type === 'STEP' ? step_details : null,
        delay_seconds: type === 'DELAY' ? delay_seconds : null,
      };

      const newBlock = await prisma.block.create({
        data: blockData,
        include: {
          child_paths: {
            include: {
              path: true
            }
          }
        }
      });

      // If it's a PATH type block, create new paths and connect them
      if (type === 'PATH' && path_options) {
        const paths = await Promise.all(
          path_options.map(async (option: string) => {
            const path = await prisma.path.create({
              data: {
                name: option,
                workflow: { connect: { id: workflow_id } },
                parent_blocks: {
                  create: {
                    block_id: newBlock.id
                  }
                }
              }
            });

            // Create default block in new path
            await prisma.block.create({
              data: {
                type: 'STEP',
                position: 0,
                icon: '/step-icons/default-icons/container.svg',
                description: 'This is a default block',
                workflow: { connect: { id: workflow_id } },
                path: { connect: { id: path.id } },
                step_details: 'Default step details'
              }
            });

            return path;
          })
        );

        return { ...newBlock, paths };
      }

      return newBlock;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}
