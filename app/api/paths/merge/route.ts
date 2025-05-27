import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BlockEndType } from '@/types/block';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface MergePathRequest {
  name: string;
  workflow_id: number;
  parent_blocks: number[];
}

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const body: MergePathRequest = await req.json();
    const { name, workflow_id, parent_blocks } = body;

    // Validate input
    if (!name || !workflow_id || !parent_blocks.length) {
      return NextResponse.json(
        { error: 'Invalid input: name, workflow_id and parent_blocks are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma_client.$transaction(async (tx) => {
      // Create new path
      const newPath = await tx.path.create({
        data: {
          name,
          workflow_id,
        }
      });

      // Create BEGIN block
      const beginBlock = await tx.block.create({
        data: {
          type: 'BEGIN',
          position: 0,
          icon: '/step-icons/default-icons/begin.svg',
          description: '',
          workflow_id,
          path_id: newPath.id,
        }
      });

      // Create LAST block
      await tx.block.create({
        data: {
          type: BlockEndType.LAST,
          position: 1,
          icon: '/step-icons/default-icons/end.svg',
          description: '',
          workflow_id,
          path_id: newPath.id,
        }
      });

      // Create parent block relationships
      await tx.path_parent_block.createMany({
        data: parent_blocks.map(blockId => ({
          block_id: blockId,
          path_id: newPath.id,
        })),
      });

      // Get the created path with its blocks and parent relationships
      const createdPath = await tx.path.findUnique({
        where: { id: newPath.id },
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
          },
          parent_blocks: {
            include: {
              block: true
            }
          }
        }
      });

      return createdPath;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error creating merge path:', error);
    return NextResponse.json(
      { error: 'Failed to create merge path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 