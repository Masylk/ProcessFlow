import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { formatTitle } from '../utils/formatTitle';

enum DelayType {
  FIXED_DURATION = 'FIXED_DURATION',
  WAIT_FOR_EVENT = 'WAIT_FOR_EVENT'
}
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
 *               delay_type:
 *                 type: string
 *                 nullable: true
 *                 description: Delay type for DELAY blocks.
 *               delay_event:
 *                 type: string
 *                 nullable: true
 *                 description: Delay event for DELAY blocks.
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
 *               path_options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of new paths to create within the PATH block.
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL for an image associated with the block.
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
    title,
    type,
    position,
    icon,
    delay_seconds,
    delay_type,
    delay_event,
    description,
    workflow_id,
    path_id,
    path_options,
    imageUrl,
  } = await req.json();

  const formattedTitle = formatTitle(title);
  const formattedDelayEvent = delay_event ? formatTitle(delay_event) : undefined;

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

  if (type === 'DELAY') {
    if (!delay_type) {
      return NextResponse.json(
        { error: 'Delay type is required for DELAY blocks.' },
        { status: 400 }
      );
    }
    if (
      delay_type === DelayType.FIXED_DURATION &&
      (delay_seconds === undefined || delay_seconds < 0)
    ) {
      return NextResponse.json(
        {
          error:
            'A valid delay value (non-negative number) is required for fixed duration delays.',
        },
        { status: 400 }
      );
    }
    if (delay_type === DelayType.WAIT_FOR_EVENT && !delay_event) {
      return NextResponse.json(
        { error: 'Event name is required for event-based delays.' },
        { status: 400 }
      );
    }
    // For event-based delays, seconds is optional but must be non-negative if provided
    if (
      delay_type === DelayType.WAIT_FOR_EVENT &&
      delay_seconds !== undefined &&
      delay_seconds < 0
    ) {
      return NextResponse.json(
        { error: 'If provided, expiration time must be non-negative.' },
        { status: 400 }
      );
    }
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Find the current max position in the path
      const maxBlock = await prisma.block.findFirst({
        where: { path_id },
        orderBy: { position: 'desc' },
        select: { position: true }
      });
      const maxPosition = maxBlock ? maxBlock.position : 0;

      if (process.env.NODE_ENV !== 'production') {
        console.debug('maxPosition', maxPosition);
      }
      const cappedPosition = Math.max(1, Math.min(position, maxPosition));

      // Update positions of existing blocks
      await prisma.block.updateMany({
        where: { workflow_id, path_id, position: { gte: cappedPosition } },
        data: { position: { increment: 1 } },
      });

      // Create the new block
      const blockData = {
        title: formattedTitle,
        type,
        position: cappedPosition,
        icon,
        description,
        image: imageUrl || null,
        workflow: { connect: { id: workflow_id } },
        path: { connect: { id: path_id } },
        delay_seconds: type === 'DELAY' ? delay_seconds : null,
        delay_type: type === 'DELAY' ? (delay_type as DelayType) : null,
        delay_event: type === 'DELAY' ? formattedDelayEvent : null,
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
