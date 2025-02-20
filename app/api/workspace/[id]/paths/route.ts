// app/api/workspace/[id]/paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /api/workspace/{id}/paths:
 *   get:
 *     summary: Retrieve all paths for a workspace based on workflow_id
 *     description: Fetches paths associated with a given `workflow_id` for the specified workspace, creating a default path and block if none exist.
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
 *         description: The ID of the workflow to filter the paths
 *     responses:
 *       200:
 *         description: Successfully retrieved paths
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
 *                               example: 0
 *                             path_block:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 5
 *                             step_block:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 15
 *                                 step_details:
 *                                   type: string
 *                                   example: "Default step details"
 *       400:
 *         description: Missing workflow_id or invalid workspaceId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "workflow_id is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch or create paths"
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const url = new URL(req.url);
  const workflow_id = url.searchParams.get('workflow_id');
  const workspaceId = parseInt(params.id);

  if (!workflow_id) {
    return NextResponse.json(
      { error: 'workflow_id is required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const parsedworkflow_id = parseInt(workflow_id, 10);

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
                path_block: {
                  include: {
                    paths: {
                      include: {
                        blocks: {
                          orderBy: {
                            position: 'asc',
                          },
                          include: {
                            path_block: {
                              include: {
                                paths: {
                                  include: {
                                    blocks: {
                                      orderBy: {
                                        position: 'asc',
                                      },
                                      include: {
                                        path_block: {
                                          include: {
                                            paths: {
                                              include: {
                                                blocks: {
                                                  include: {
                                                    path_block: true,
                                                    step_block: true,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                        step_block: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            step_block: true,
                          },
                        },
                      },
                    },
                  },
                },
                step_block: true,
              },
            },
          },
        });

        if (existingPaths.length === 0) {
          const newPath = await prisma.path.create({
            data: {
              name: 'First Path',
              workflow_id: parsedworkflow_id,
              path_block_id: null,
            },
          });

          // Create the default step block inside the new path
          const defaultBlockData: any = {
            type: 'STEP',
            position: 0,
            icon: '/step-icons/default-icons/container.svg',
            description: 'This is the default step block',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
            step_block: {
              create: {
                step_details: 'Default step details',
              },
            },
          };

          const defaultBlock = await prisma.block.create({
            data: defaultBlockData,
            include: {
              step_block: true,
            },
          });

          return { paths: [{ ...newPath, blocks: [defaultBlock] }] };
        }

        // Return existing paths with their associated blocks
        return { paths: existingPaths };
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths' },
      { status: 500 }
    );
  }
}
