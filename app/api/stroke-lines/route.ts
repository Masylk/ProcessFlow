import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/stroke-lines:
 *   post:
 *     summary: Create a new stroke line
 *     description: Creates a new connection line between two blocks in a workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source_block_id
 *               - target_block_id
 *               - workflow_id
 *               - label
 *             properties:
 *               source_block_id:
 *                 type: integer
 *                 description: ID of the source block
 *               target_block_id:
 *                 type: integer
 *                 description: ID of the target block
 *               workflow_id:
 *                 type: integer
 *                 description: ID of the workflow
 *               label:
 *                 type: string
 *                 description: Label for the stroke line
 *               is_loop:
 *                 type: boolean
 *                 description: Whether the connection is a loop
 *                 default: false
 *     responses:
 *       200:
 *         description: Stroke line created successfully
 *       400:
 *         description: Missing required fields or duplicate stroke line
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source_block_id, target_block_id, workflow_id, label, is_loop = false } = body;

    // Validate required fields
    if (!source_block_id || !target_block_id || !workflow_id || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a stroke line with same source and target already exists
    const existingStrokeLine = await prisma.stroke_line.findFirst({
      where: {
        source_block_id,
        target_block_id,
        workflow_id,
      },
    });

    if (existingStrokeLine) {
      return NextResponse.json(
        { error: 'A stroke line between these blocks already exists' },
        { status: 400 }
      );
    }

    // Create new stroke line
    const strokeLine = await prisma.stroke_line.create({
      data: {
        source_block_id,
        target_block_id,
        workflow_id,
        label,
        is_loop,
      },
    });

    return NextResponse.json(strokeLine);
  } catch (error) {
    console.error('Error creating stroke line:', error);
    return NextResponse.json(
      { error: 'Failed to create stroke line' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stroke-lines:
 *   put:
 *     summary: Update an existing stroke line
 *     description: Modifies an existing stroke line's properties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the stroke line to update
 *               source_block_id:
 *                 type: integer
 *                 description: New source block ID
 *               target_block_id:
 *                 type: integer
 *                 description: New target block ID
 *               workflow_id:
 *                 type: integer
 *                 description: ID of the workflow
 *               label:
 *                 type: string
 *                 description: New label for the stroke line
 *               is_loop:
 *                 type: boolean
 *                 description: Whether the connection is a loop
 *     responses:
 *       200:
 *         description: Stroke line updated successfully
 *       400:
 *         description: Missing ID or duplicate stroke line
 *       500:
 *         description: Server error
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, source_block_id, target_block_id, workflow_id, label, is_loop } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing stroke line ID' },
        { status: 400 }
      );
    }

    // Check if the new source/target combination already exists for another stroke line
    const existingStrokeLine = await prisma.stroke_line.findFirst({
      where: {
        source_block_id,
        target_block_id,
        workflow_id,
        NOT: {
          id,
        },
      },
    });

    if (existingStrokeLine) {
      return NextResponse.json(
        { error: 'A stroke line between these blocks already exists' },
        { status: 400 }
      );
    }

    // Update stroke line
    const updatedStrokeLine = await prisma.stroke_line.update({
      where: { id },
      data: {
        source_block_id,
        target_block_id,
        workflow_id,
        label,
        is_loop,
      },
    });

    return NextResponse.json(updatedStrokeLine);
  } catch (error) {
    console.error('Error updating stroke line:', error);
    return NextResponse.json(
      { error: 'Failed to update stroke line' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stroke-lines:
 *   delete:
 *     summary: Delete a stroke line
 *     description: Removes a stroke line from the workflow
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the stroke line to delete
 *     responses:
 *       200:
 *         description: Stroke line deleted successfully
 *       400:
 *         description: Missing stroke line ID
 *       500:
 *         description: Server error
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing stroke line ID' },
        { status: 400 }
      );
    }

    await prisma.stroke_line.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Stroke line deleted successfully' });
  } catch (error) {
    console.error('Error deleting stroke line:', error);
    return NextResponse.json(
      { error: 'Failed to delete stroke line' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stroke-lines:
 *   get:
 *     summary: Get all stroke lines for a workflow
 *     description: Retrieves all stroke lines associated with a specific workflow
 *     parameters:
 *       - in: query
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the workflow to get stroke lines for
 *     responses:
 *       200:
 *         description: List of stroke lines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   source_block_id:
 *                     type: integer
 *                   target_block_id:
 *                     type: integer
 *                   workflow_id:
 *                     type: integer
 *                   label:
 *                     type: string
 *                   is_loop:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Missing workflow ID
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflow_id');

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Missing workflow ID' },
        { status: 400 }
      );
    }

    const strokeLines = await prisma.stroke_line.findMany({
      where: {
        workflow_id: parseInt(workflowId),
      },
    });

    return NextResponse.json(strokeLines);
  } catch (error) {
    console.error('Error fetching stroke lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stroke lines' },
      { status: 500 }
    );
  }
} 