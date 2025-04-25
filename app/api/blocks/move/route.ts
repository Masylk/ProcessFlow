import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { BlockEndType, BlockType } from '@/types/block';

interface MoveBlocksRequest {
  block_ids: number[];
  destination_path_id: number;
}

/**
 * @swagger
 * /api/blocks/move:
 *   post:
 *     summary: Move blocks to a destination path
 *     description: Moves specified blocks to a destination path, maintaining proper block ordering and ensuring END block remains last
 *     tags:
 *       - Blocks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - block_ids
 *               - destination_path_id
 *             properties:
 *               block_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of block IDs to move
 *               destination_path_id:
 *                 type: integer
 *                 description: ID of the destination path
 *     responses:
 *       200:
 *         description: Blocks successfully moved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 blocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       position:
 *                         type: integer
 *                       type:
 *                         type: string
 *       400:
 *         description: Invalid input parameters
 *       404:
 *         description: Path or blocks not found
 *       500:
 *         description: Server error
 */

export async function POST(req: NextRequest) {
  try {
    const body: MoveBlocksRequest = await req.json();
    const { block_ids, destination_path_id } = body;

    // Validate input
    if (!Array.isArray(block_ids) || block_ids.length === 0 || !destination_path_id) {
      return NextResponse.json(
        { error: 'Invalid input: block_ids array and destination_path_id are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // Get destination path blocks to find END block and current positions
      const destinationBlocks = await tx.block.findMany({
        where: { path_id: destination_path_id },
        orderBy: { position: 'asc' },
      });

      // Find any end-type block
      const endBlock = destinationBlocks.find(block => 
        Object.values(BlockEndType).includes(block.type as BlockEndType)
      );

      if (!endBlock) {
        throw new Error('Destination path has no end-type block');
      }

      // Calculate position before END block
      const positionBeforeEnd = endBlock.position - 1;

      // Update all blocks in a single query for better performance
      await tx.block.updateMany({
        where: {
          id: {
            in: block_ids
          }
        },
        data: {
          path_id: destination_path_id,
        }
      });

      // First, put the Begin block to position 0
        await tx.block.updateMany({
          where: {
            path_id: destination_path_id,
            type: { 
              in: [BlockType.BEGIN]
            }
          },
          data: {
            position: 0
          }
        });

      // Update positions of moved blocks
      const updates = block_ids.map((blockId, index) => {
        console.log('index', index);
        return tx.block.update({
          where: { id: blockId },
          data: { 
            position: index + 1
          }
        });
      });

      // Execute all position updates in parallel
      await Promise.all(updates);

      // Ensure END block is at the last position
      await tx.block.update({
        where: { id: endBlock.id },
        data: { 
          position: block_ids.length + 1
        }
      });

      // Get the updated path with all blocks
      const updatedPath = await tx.path.findUnique({
        where: { id: destination_path_id },
        include: {
          blocks: {
            orderBy: { position: 'asc' },
            include: {
              child_paths: {
                include: {
                  path: true
                }
              }
            }
          }
        }
      });

      return updatedPath;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error moving blocks:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to move blocks' },
      { status: 500 }
    );
  }
}