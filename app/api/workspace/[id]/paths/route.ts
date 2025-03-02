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
      let existingPaths = await prisma.path.findMany({
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

      // Function to fix block positions in a path
      const fixPathBlockPositions = async (path: any) => {
        const blocks = [...path.blocks];
        let needsUpdate = false;

        // Find BEGIN and END blocks
        const beginBlock = blocks.find(b => b.type === 'BEGIN');
        const endBlock = blocks.find(b => b.type === 'END');

        // Create BEGIN block if it doesn't exist
        if (!beginBlock) {
          needsUpdate = true;
          const newBeginBlock = await prisma.block.create({
            data: {
              type: 'BEGIN',
              position: 0,
              icon: '/step-icons/default-icons/begin.svg',
              description: 'Start of the workflow',
              workflow: { connect: { id: path.workflow_id } },
              path: { connect: { id: path.id } },
              step_details: 'Begin',
            }
          });
          blocks.unshift({ ...newBeginBlock, child_paths: [] });
        } else if (beginBlock.position !== 0) {
          needsUpdate = true;
          // Remove BEGIN block from current position
          const beginIndex = blocks.findIndex(b => b.type === 'BEGIN');
          blocks.splice(beginIndex, 1);
          // Insert BEGIN block at position 0
          blocks.unshift(beginBlock);
        }

        // Create END block if it doesn't exist
        if (!endBlock) {
          needsUpdate = true;
          const newEndBlock = await prisma.block.create({
            data: {
              type: 'END',
              position: blocks.length,
              icon: '/step-icons/default-icons/end.svg',
              description: 'End of the workflow',
              workflow: { connect: { id: path.workflow_id } },
              path: { connect: { id: path.id } },
              step_details: 'End',
            }
          });
          blocks.push({ ...newEndBlock, child_paths: [] });
        } else if (endBlock.position !== blocks.length - 1) {
          needsUpdate = true;
          // Remove END block from current position
          const endIndex = blocks.findIndex(b => b.type === 'END');
          blocks.splice(endIndex, 1);
          // Add END block at the end
          blocks.push(endBlock);
        }

        // Create default STEP block if there are no blocks between BEGIN and END
        if (blocks.length === 2) { // Only BEGIN and END blocks exist
          needsUpdate = true;
          const newStepBlock = await prisma.block.create({
            data: {
              type: 'STEP',
              position: 1,
              icon: '/step-icons/default-icons/container.svg',
              description: 'This is a default block',
              workflow: { connect: { id: path.workflow_id } },
              path: { connect: { id: path.id } },
              step_details: 'Default step details',
            }
          });
          blocks.splice(1, 0, { ...newStepBlock, child_paths: [] });
        }

        if (needsUpdate) {
          // Update positions for all blocks
          const updates = blocks.map((block, index) => 
            prisma.block.update({
              where: { id: block.id },
              data: { position: index }
            })
          );

          await Promise.all(updates);

          // Return updated path with correct block positions
          return {
            ...path,
            blocks: blocks.map((block, index) => ({
              ...block,
              position: index
            }))
          };
        }

        return path;
      };

      // Process existing paths or create new one
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
        // Fix positions in all existing paths
        const updatedPaths = await Promise.all(
          existingPaths.map(path => fixPathBlockPositions(path))
        );

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
