import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { BlockEndType } from '@/types/block';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface ConnectPathsRequest {
  child_path_ids: number[];
  destination_path_id: number;
  pathblock_title?: string;
  pathblock_description?: string;
  pathblock_icon?: string;
}

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const body: ConnectPathsRequest = await req.json();
    const { child_path_ids, destination_path_id, pathblock_title, pathblock_description, pathblock_icon } = body;

    // Validate input
    if (!Array.isArray(child_path_ids) || child_path_ids.length === 0 || !destination_path_id) {
      return NextResponse.json(
        { error: 'Invalid input: child_path_ids array and destination_path_id are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma_client.$transaction(async (tx) => {
      // Find any end-type block of the destination path
      const destinationEndBlock = await tx.block.findFirst({
        where: {
          path_id: destination_path_id,
          type: {
            in: Object.values(BlockEndType)
          }
        }
      });

      if (!destinationEndBlock) {
        throw new Error('Destination path has no end-type block');
      }

      // Update block type to PATH if it isn't already
      if (destinationEndBlock.type !== BlockEndType.PATH || pathblock_title || pathblock_description || pathblock_icon) {
        await tx.block.update({
          where: { id: destinationEndBlock.id },
          data: { type: BlockEndType.PATH, title: pathblock_title, description: pathblock_description, icon: pathblock_icon }
        });
      }

      // Delete existing parent block relationships for the child paths
      await tx.path_parent_block.deleteMany({
        where: {
          path_id: {
            in: child_path_ids
          }
        }
      });

      // Create new relationships with the destination path's END block
      const newRelationships = child_path_ids.map(pathId => ({
        path_id: pathId,
        block_id: destinationEndBlock.id
      }));

      await tx.path_parent_block.createMany({
        data: newRelationships
      });

      // Get the updated destination path with all its relationships
      const updatedPath = await tx.path.findUnique({
        where: { id: destination_path_id },
        include: {
          blocks: {
            orderBy: { position: 'asc' },
            include: {
              child_paths: {
                include: {
                  path: {
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
                  }
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
    console.error('Error connecting paths:', error);
    
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
      { error: 'Failed to connect paths' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

/**
 * @swagger
 * /api/paths/connect:
 *   post:
 *     summary: Connect child paths to a destination path's END block
 *     description: Disconnects child paths from their current parent blocks and connects them to the END block of the destination path
 *     tags:
 *       - Paths
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - child_path_ids
 *               - destination_path_id
 *             properties:
 *               child_path_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of path IDs to connect as children
 *               destination_path_id:
 *                 type: integer
 *                 description: ID of the destination path
 *     responses:
 *       200:
 *         description: Paths successfully connected
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
 *                       child_paths:
 *                         type: array
 *                         items:
 *                           type: object
 *       400:
 *         description: Invalid input parameters
 *       404:
 *         description: Path or END block not found
 *       500:
 *         description: Server error
 */ 