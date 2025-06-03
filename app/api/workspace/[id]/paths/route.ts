// app/api/workspace/[id]/paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';
import { BlockEndType } from '@/types/block';
import { createSignedUrls } from '@/utils/createSignedUrls';
import { isVercel } from '@/app/api/utils/isVercel';

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

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  if (!workflow_id || isNaN(workspaceId)) {
    return NextResponse.json(
      { error: 'workflow_id and valid workspaceId are required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma_client.$transaction(async (prisma: Prisma.TransactionClient) => {
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

        // Find BEGIN and end-type blocks
        const beginBlock = blocks.find(b => b.type === 'BEGIN');
        const endTypeBlock = blocks.find(b => Object.values(BlockEndType).includes(b.type as BlockEndType));

        // Create BEGIN block if it doesn't exist
        if (!beginBlock) {
          needsUpdate = true;
          const newBeginBlock = await prisma.block.create({
            data: {
              type: 'BEGIN',
              position: 0,
              icon: '/step-icons/default-icons/begin.svg',
              description: '',
              workflow: { connect: { id: path.workflow_id } },
              path: { connect: { id: path.id } },
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

        // Check if end-type block exists and has child paths
        if (endTypeBlock) {
          if (endTypeBlock.child_paths?.length > 1) {
            needsUpdate = true;
            await prisma.block.update({
              where: { id: endTypeBlock.id },
              data: { type: BlockEndType.PATH }
            });
            endTypeBlock.type = BlockEndType.PATH;
          } else if (endTypeBlock.child_paths?.length === 1) {
            needsUpdate = true;
            await prisma.block.update({
              where: { id: endTypeBlock.id },
              data: { type: BlockEndType.MERGE }
            });
            endTypeBlock.type = BlockEndType.MERGE;
          } else if (endTypeBlock.child_paths?.length === 0 && 
                    endTypeBlock.type !== BlockEndType.LAST && 
                    endTypeBlock.type !== BlockEndType.END) {
            needsUpdate = true;
            await prisma.block.update({
              where: { id: endTypeBlock.id },
              data: { type: BlockEndType.LAST }
            });
            endTypeBlock.type = BlockEndType.LAST;
          }
        } else {
          // Create default end-type block if none exists
          needsUpdate = true;
          const newEndBlock = await prisma.block.create({
            data: {
              type: BlockEndType.LAST,
              position: blocks.length,
              icon: '/step-icons/default-icons/end.svg',
              description: '',
              workflow: { connect: { id: path.workflow_id } },
              path: { connect: { id: path.id } },
            }
          });
          blocks.push({ ...newEndBlock, child_paths: [] });
        }

        // Create default STEP block if there are no blocks between BEGIN and end-type block
        // if (blocks.length === 2) { // Only BEGIN and end-type blocks exist
        //   needsUpdate = true;
        //   const newStepBlock = await prisma.block.create({
        //     data: {
        //       type: 'STEP',
        //       position: 1,
        //       icon: '/step-icons/default-icons/container.svg',
        //       description: '',
        //       workflow: { connect: { id: path.workflow_id } },
        //       path: { connect: { id: path.id } },
        //     }
        //   });
        //   blocks.splice(1, 0, { ...newStepBlock, child_paths: [] });
        // }

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

      // if (existingPaths.length > 1) {
      //   // 1. Find all paths with no parent_blocks
      //   const rootPaths = existingPaths.filter(path => !path.parent_blocks || path.parent_blocks.length === 0);

      //   // Only delete if there are more than one rootPaths
      //   if (rootPaths.length > 1) {
      //     // 2. Find all root paths that have only 2 blocks (one BEGIN and one END/LAST)
      //     const pathsToDelete = rootPaths.filter(path => {
      //       if (!path.blocks || path.blocks.length !== 2) return false;
      //       const types = path.blocks.map(b => b.type);
      //       return (
      //         types.includes('BEGIN') &&
      //         (types.includes('END') || types.includes('LAST'))
      //       );
      //     });

      //     // 3. Delete those paths
      //     for (const path of pathsToDelete) {
      //       // Delete blocks first due to foreign key constraints
      //       await prisma.block.deleteMany({ where: { path_id: path.id } });
      //       await prisma.path.delete({ where: { id: path.id } });
      //     }
      //   }
      // }

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
            description: '',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
          }
        });

        // Create END block
        await prisma.block.create({
          data: {
            type: 'LAST',
            position: 2,
            icon: '/step-icons/default-icons/end.svg',
            description: '',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
          }
        });

        return { paths: [newPath] };
      } else {
        // Fix positions in all existing paths
        const updatedPaths = await Promise.all(
          existingPaths.map(path => fixPathBlockPositions(path))
        );

        // Add signed URLs to each path's blocks
        const signedPaths = await Promise.all(
          updatedPaths.map(path => createSignedUrls(path))
        );

        return { paths: signedPaths };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to fetch or create paths' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}