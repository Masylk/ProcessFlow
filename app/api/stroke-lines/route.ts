import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatTitle } from '../utils/formatTitle';
import { isVercel } from '../utils/isVercel';
import { PrismaClient } from '@prisma/client';

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
 *               control_points:
 *                 type: array
 *                 description: Control points for the stroke line
 *     responses:
 *       200:
 *         description: Stroke line created successfully
 *       400:
 *         description: Missing required fields or duplicate stroke line
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const body = await request.json();
    const { source_block_id, target_block_id, workflow_id, label, control_points = null } = body;

    // Validate required fields
    if (!source_block_id || !target_block_id || !workflow_id || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const formattedLabel = formatTitle(label);

    // Check if a stroke line with same source and target already exists
    const existingStrokeLine = await prisma_client.stroke_line.findFirst({
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
    const strokeLine = await prisma_client.stroke_line.create({
      data: {
        source_block_id,
        target_block_id,
        workflow_id,
        label: formattedLabel || '',
        control_points: control_points ? { set: control_points } : undefined,
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
 *               control_points:
 *                 type: array
 *                 description: New control points for the stroke line
 *     responses:
 *       200:
 *         description: Stroke line updated successfully
 *       400:
 *         description: Missing ID or duplicate stroke line
 *       500:
 *         description: Server error
 */
export async function PUT(request: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const body = await request.json();
    const { id, source_block_id, target_block_id, workflow_id, label, control_points } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing stroke line ID' },
        { status: 400 }
      );
    }

    // Check if the new source/target combination already exists for another stroke line
    const existingStrokeLine = await prisma_client.stroke_line.findFirst({
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

    const formattedLabel = label ? formatTitle(label) : undefined;

    // Update stroke line
    const updatedStrokeLine = await prisma_client.stroke_line.update({
      where: { id },
      data: {
        source_block_id,
        target_block_id,
        workflow_id,
        label: formattedLabel,
        control_points: control_points ? { set: control_points } : undefined,
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
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing stroke line ID' },
        { status: 400 }
      );
    }

    // Fetch the stroke line to get source_block_id and target_block_id
    const strokeLine = await prisma_client.stroke_line.findUnique({
      where: { id: parseInt(id) },
      select: { source_block_id: true, target_block_id: true },
    });
    if (!strokeLine) {
      return NextResponse.json(
        { error: 'Stroke line not found' },
        { status: 404 }
      );
    }

    const { source_block_id } = strokeLine;

    await prisma_client.stroke_line.delete({
      where: { id: parseInt(id) },
    });

    // Count remaining stroke lines where this block is the source and NOT self-referencing
    const remainingCount = await prisma_client.stroke_line.count({
      where: {
        source_block_id,
      },
    });

    if (remainingCount === 0) {
      // Set is_endpoint to false
      await prisma_client.block.update({
        where: { id: source_block_id },
        data: { is_endpoint: false },
      });
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
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
 *     summary: Get stroke lines
 *     description: Retrieves either a single stroke line by ID or all stroke lines for a workflow
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of a specific stroke line to fetch
 *       - in: query
 *         name: workflow_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the workflow to get all stroke lines for
 *     responses:
 *       200:
 *         description: Single stroke line or list of stroke lines
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: Stroke line not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const workflowId = searchParams.get('workflow_id');

    // Helper function to transform control points
    const transformControlPoints = (strokeLine: any) => {
      if (strokeLine.control_points && strokeLine.control_points.set) {
        return {
          ...strokeLine,
          control_points: strokeLine.control_points.set
        };
      }
      return strokeLine;
    };

    // If ID is provided, fetch single stroke line
    if (id) {
      const strokeLine = await prisma_client.stroke_line.findUnique({
        where: {
          id: parseInt(id),
        },
        select: {
          id: true,
          source_block_id: true,
          target_block_id: true,
          workflow_id: true,
          label: true,
          control_points: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!strokeLine) {
        return NextResponse.json(
          { error: 'Stroke line not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(transformControlPoints(strokeLine));
    }

    // If workflow_id is provided, fetch all stroke lines for that workflow
    if (workflowId) {
      const strokeLines = await prisma_client.stroke_line.findMany({
        where: {
          workflow_id: parseInt(workflowId),
        },
        select: {
          id: true,
          source_block_id: true,
          target_block_id: true,
          workflow_id: true,
          label: true,
          control_points: true,
          created_at: true,
          updated_at: true,
        },
      });

      return NextResponse.json(strokeLines.map(transformControlPoints));
    }

    // If neither parameter is provided
    return NextResponse.json(
      { error: 'Missing required parameter: either id or workflow_id must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching stroke lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stroke lines' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stroke-lines:
 *   patch:
 *     summary: Update control points of a stroke line
 *     description: Updates the control points of an existing stroke line
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - control_points
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the stroke line to update
 *               control_points:
 *                 type: array
 *                 description: New control points for the stroke line
 *     responses:
 *       200:
 *         description: Control points updated successfully
 *       400:
 *         description: Missing stroke line ID
 *       500:
 *         description: Server error
 */
export async function PATCH(request: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { control_points } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing stroke line ID' },
        { status: 400 }
      );
    }

    // Validate control points structure
    if (!Array.isArray(control_points) || !control_points.every(point => 
      point !== null &&
      typeof point === 'object' &&
      typeof point.x === 'number' && !isNaN(point.x) &&
      typeof point.y === 'number' && !isNaN(point.y)
    )) {
      return NextResponse.json(
        { error: 'Invalid control points format' },
        { status: 400 }
      );
    }

    // Update only the control points using Prisma's set operator for JSON fields
    const updatedStrokeLine = await prisma_client.stroke_line.update({
      where: { 
        id: parseInt(id) 
      },
      data: {
        control_points: {
          set: control_points
        },
        updated_at: new Date()
      },
    });

    // Transform the response to remove the 'set' wrapper
    const transformedStrokeLine = {
      ...updatedStrokeLine,
      control_points: control_points
    };

    return NextResponse.json(transformedStrokeLine);
  } catch (error) {
    console.error('Error updating control points:', error);
    return NextResponse.json(
      { error: 'Failed to update control points' },
      { status: 500 }
    );
  }
} 