// app/api/workflows/[workflow_id]/reorder-blocks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BlockUpdate = {
  id: number;
  position: number;
};

/**
 * @swagger
 * /api/workflows/{workflow_id}/reorder-blocks:
 *   put:
 *     summary: Reorder blocks within a workflow
 *     description: Updates the positions of multiple blocks in a workflow.
 *     tags:
 *       - Workflow
 *     parameters:
 *       - in: path
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the workflow whose blocks are being reordered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 position:
 *                   type: integer
 *                   example: 2
 *     responses:
 *       200:
 *         description: Successfully reordered blocks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blocks reordered successfully"
 *                 updatedBlocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       position:
 *                         type: integer
 *                         example: 2
 *       400:
 *         description: Invalid input or workflow ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid workflow ID"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function PUT(request: Request, props: { params: Promise<{ workflow_id: string }> }) {
  const params = await props.params;
  try {
    const workflow_id = parseInt(params.workflow_id, 10);

    // Validate workflow_id
    if (isNaN(workflow_id)) {
      return NextResponse.json(
        { error: 'Invalid workflow ID' },
        { status: 400 }
      );
    }

    const updatedPositions: BlockUpdate[] = await request.json();

    // Validate input
    if (
      !Array.isArray(updatedPositions) ||
      updatedPositions.some(
        (block) =>
          typeof block.id !== 'number' || typeof block.position !== 'number'
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid input. Expected an array of objects with numeric id and position.',
        },
        { status: 400 }
      );
    }

    // Update block positions in a transaction
    const result = await prisma.$transaction(
      updatedPositions.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { position: block.position },
        })
      )
    );

    return NextResponse.json({
      message: 'Blocks reordered successfully',
      updatedBlocks: result,
    });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
