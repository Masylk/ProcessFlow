import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { BlockEndType } from '@/types/block';

interface CreateMinimalPathRequest {
  name: string;
  workflow_id: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateMinimalPathRequest = await req.json();
    const { name, workflow_id } = body;

    // Validate input
    if (!name || !workflow_id) {
      return NextResponse.json(
        { error: 'Invalid input: name and workflow_id are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // Create new path
      const newPath = await tx.path.create({
        data: {
          name,
          workflow_id,
        }
      });

      // Create BEGIN block
      await tx.block.create({
        data: {
          type: 'BEGIN',
          position: 0,
          icon: '/step-icons/default-icons/begin.svg',
          description: '',
          workflow_id,
          path_id: newPath.id,
          step_details: 'Begin',
        }
      });

      // Create LAST block instead of END block
      await tx.block.create({
        data: {
          type: BlockEndType.LAST,
          position: 1, // Position 1 since there's only BEGIN before it
          icon: '/step-icons/default-icons/end.svg',
          description: '',
          workflow_id,
          path_id: newPath.id,
          step_details: 'Last',
        }
      });

      // Get the created path with its blocks
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
          }
        }
      });

      return createdPath;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error creating minimal path:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Path with this name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create path' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/paths/minimal:
 *   post:
 *     summary: Create a minimal path with only BEGIN and END blocks
 *     description: Creates a new path with just BEGIN and END blocks, without the default STEP block
 *     tags:
 *       - Paths
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workflow_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the new path
 *               workflow_id:
 *                 type: integer
 *                 description: ID of the workflow this path belongs to
 *     responses:
 *       200:
 *         description: Path successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 blocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [BEGIN, END]
 *                       position:
 *                         type: integer
 *       400:
 *         description: Invalid input parameters
 *       409:
 *         description: Path with this name already exists
 *       500:
 *         description: Server error
 */ 