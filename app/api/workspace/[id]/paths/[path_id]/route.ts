// app/api/workspace/[id]/paths/[path_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path according to your setup

/**
 * @swagger
 * /api/workspace/{id}/paths/{path_id}:
 *   get:
 *     summary: Retrieve a specific path and its blocks within a workspace
 *     description: Fetches details of a specific path, including its blocks, path_block, step_block, and delay_block, filtered by workflow_id.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace
 *       - in: path
 *         name: path_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the path
 *       - in: query
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workflow to filter the blocks
 *     responses:
 *       200:
 *         description: Successfully retrieved path data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Sample Path"
 *                 blocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       position:
 *                         type: integer
 *                         example: 1
 *                       path_block:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                       step_block:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 15
 *                           step_data:
 *                             type: string
 *                             example: "Step details"
 *                       delay_block:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 20
 *                           delay_time:
 *                             type: integer
 *                             example: 300
 *       400:
 *         description: Missing or invalid workspaceId, path_id, or workflow_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Valid workspaceId, path_id, and workflow_id are required"
 *       404:
 *         description: Path not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Path not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; path_id: string }> }
) {
  const params = await props.params;
  const url = new URL(req.url);
  const workflow_id = url.searchParams.get('workflow_id');
  const workspaceId = parseInt(params.id);
  const path_id = parseInt(params.path_id);

  // Validate inputs
  if (!workflow_id || isNaN(workspaceId) || isNaN(path_id)) {
    return NextResponse.json(
      { error: 'workflow_id, valid workspaceId and path_id are required' },
      { status: 400 }
    );
  }

  try {
    const parsedworkflow_id = parseInt(workflow_id);

    if (isNaN(parsedworkflow_id)) {
      return NextResponse.json(
        { error: 'Invalid workflow_id' },
        { status: 400 }
      );
    }

    // Fetch blocks for the workflow
    const blocks = await prisma.block.findMany({
      where: { workflow_id: parsedworkflow_id },
      include: {
        child_paths: {
          include: {
            path: true
          }
        }
      },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}
