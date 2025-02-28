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

  if (!workflow_id || isNaN(workspaceId)) {
    return NextResponse.json(
      { error: 'workflow_id and valid workspaceId are required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
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
              child_paths: {
                include: {
                  path: true
                }
              }
            }
          },
          parent_blocks: true,
        }
      });

      if (existingPaths.length === 0) {
        // Create new path if none exists
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
              }
            }
          }
        });

        // Create BEGIN block
        await prisma.block.create({
          data: {
            type: 'BEGIN',
            position: 0,
            icon: '/step-icons/default-icons/begin.svg',
            description: 'Start of the workflow',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
            step_details: 'Begin',
          }
        });

        // Create default block
        await prisma.block.create({
          data: {
            type: 'STEP',
            position: 1,
            icon: '/step-icons/default-icons/container.svg',
            description: 'This is a default block',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
            step_details: 'Default step details',
          }
        });

        // Create END block
        await prisma.block.create({
          data: {
            type: 'END',
            position: 2,
            icon: '/step-icons/default-icons/end.svg',
            description: 'End of the workflow',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
            step_details: 'End',
          }
        });

        return { paths: [newPath] };
      } else {
        // For existing paths, check and fix BEGIN and END blocks
        for (const path of existingPaths) {
          const blocks = path.blocks;
          // Set default maxPosition to -1 if there are no blocks
          const maxPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position)) : -1;

          // Check BEGIN block
          const beginBlock = blocks.find(b => b.type === 'BEGIN');
          if (!beginBlock) {
            // Shift all blocks' positions up by 1
            if (blocks.length > 0) {
              await prisma.block.updateMany({
                where: { path_id: path.id },
                data: {
                  position: {
                    increment: 1
                  }
                }
              });
            }

            // Create BEGIN block at position 0
            await prisma.block.create({
              data: {
                type: 'BEGIN',
                position: 0, // Always at position 0
                icon: '/step-icons/default-icons/begin.svg',
                description: 'Start of the workflow',
                workflow: { connect: { id: parsedworkflow_id } },
                path: { connect: { id: path.id } },
                step_details: 'Begin',
              }
            });
          }

          // Check END block
          const endBlock = blocks.find(b => b.type === 'END');
          if (!endBlock) {
            // Create END block at the last position
            await prisma.block.create({
              data: {
                type: 'END',
                position: maxPosition + 1, // This will be 0 if there were no blocks
                icon: '/step-icons/default-icons/end.svg',
                description: 'End of the workflow',
                workflow: { connect: { id: parsedworkflow_id } },
                path: { connect: { id: path.id } },
                step_details: 'End',
              }
            });
          }
        }

        // Fetch updated paths
        const updatedPaths = await prisma.path.findMany({
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
                    path: true
                  }
                }
              }
            },
            parent_blocks: true,
          }
        });

        return { paths: updatedPaths };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to fetch or create paths' },
      { status: 500 }
    );
  }
}
