// app/api/blocks/[blockId]/paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path as necessary

/**
 * @swagger
 * /api/blocks/{blockId}/paths:
 *   get:
 *     summary: Get paths linked to a specific block
 *     description: Retrieves paths associated with a given block ID.
 *     tags:
 *       - Blocks
 *     parameters:
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the block to fetch paths for.
 *     responses:
 *       200:
 *         description: A list of paths associated with the block.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   workflow_id:
 *                     type: integer
 *       400:
 *         description: Invalid blockId provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid blockId
 *       500:
 *         description: Error fetching paths for the block.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch paths
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const blockId = parseInt(params.id);
  console.log(blockId);
  // Validate blockId
  if (isNaN(blockId)) {
    return NextResponse.json({ error: 'Invalid blockId' }, { status: 400 });
  }

  try {
    // Fetch paths linked to the block
    const paths = await prisma.path.findMany({
      where: {
        path_block_id: blockId, // Adjust based on your schema
      },
      select: {
        id: true,
        name: true,
        workflow_id: true,
        // Add other fields as necessary
      },
    });
    console.log(paths);
    return NextResponse.json(paths);
  } catch (error) {
    console.error('Error fetching paths for block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paths' },
      { status: 500 }
    );
  }
}
