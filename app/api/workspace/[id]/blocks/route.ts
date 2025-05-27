// app/api/workspace/[id]/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/workspace/{id}/blocks:
 *   get:
 *     summary: Retrieve paths and blocks for a given workflow in a workspace
 *     description: Fetches all paths and their associated blocks for a given workflow in a workspace. If no paths exist, it creates a default path.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace
 *       - in: query
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workflow
 *     responses:
 *       200:
 *         description: Successfully retrieved paths and blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paths:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "First Path"
 *                       workflow_id:
 *                         type: integer
 *                         example: 123
 *                       blocks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 10
 *                             position:
 *                               type: integer
 *                               example: 1
 *                             path_block:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 5
 *                                 paths:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: integer
 *                                         example: 20
 *                                       name:
 *                                         type: string
 *                                         example: "Nested Path"
 *                             step_block:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 15
 *                                 step_data:
 *                                   type: string
 *                                   example: "Step details"
 *       400:
 *         description: Missing or invalid workflow_id or workspaceId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "workflow_id and valid workspaceId are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch or create paths and blocks"
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const url = new URL(req.url);
  const workflow_id = url.searchParams.get('workflow_id');
  const workspaceId = parseInt(params.id);
    const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  // Validate workflow_id and workspaceId
  if (!workflow_id || isNaN(workspaceId)) {
    return NextResponse.json(
      { error: 'workflow_id and valid workspaceId are required' },
      { status: 400 }
    );
  }

  try {
    // Convert workflow_id to a number for further processing
    const parsedworkflow_id = parseInt(workflow_id);

    if (isNaN(parsedworkflow_id)) {
      return NextResponse.json(
        { error: 'Invalid workflow_id' },
        { status: 400 }
      );
    }

    // Log the request data
   

    // Fetch or create paths with blocks for the given workflow_id
    const result = await prisma_client.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        // Fetch paths for the given workflow_id
        const existingPaths = await prisma.path.findMany({
          where: {
            workflow_id: parsedworkflow_id,
          },
          include: {
            blocks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                child_paths: {
                  include: {
                    path: {
                      include: {
                        blocks: {
                          orderBy: {
                            position: 'asc',
                          },
                          include: {
                            child_paths: {
                              include: {
                                path: {
                                  include: {
                                    blocks: {
                                      orderBy: {
                                        position: 'asc',
                                      },
                                      include: {
                                        child_paths: {
                                          include: {
                                            path: {
                                              include: {
                                                blocks: {
                                                  include: {
                                                    child_paths: true
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // If no paths are found, create a new Path without linking to a path_block
        if (existingPaths.length === 0) {
          const newPath = await prisma.path.create({
            data: {
              name: 'First Path',
              workflow_id: parsedworkflow_id,
            },
            include: {
              blocks: {
                include: {
                  child_paths: {
                    include: {
                      path: true
                    }
                  }
                },
              },
            },
          });

          return { paths: [newPath] };
        }

        // Return existing paths
        return { paths: existingPaths };
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths and blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths and blocks' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
