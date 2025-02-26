import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspace/{id}/workflows/{workflowId}:
 *   get:
 *     summary: Retrieve a specific workflow
 *     description: Fetches a single workflow by its ID within a specific workspace
 *     tags:
 *       - Workspace
 *       - Workflow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workflow
 *     responses:
 *       200:
 *         description: Successfully retrieved the workflow
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
 *                   example: "My Workflow"
 *                 description:
 *                   type: string
 *                   example: "A detailed workflow description"
 *                 workspace_id:
 *                   type: integer
 *                   example: 1
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-20T12:00:00Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-20T12:00:00Z"
 *       400:
 *         description: Invalid workspace ID or workflow ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid workspace ID or workflow ID"
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workflow not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; workflowId: string }> }
) {
  const params = await props.params;
  const workspace_id = parseInt(params.id);
  const workflow_id = parseInt(params.workflowId);

  if (isNaN(workspace_id) || isNaN(workflow_id)) {
    return NextResponse.json(
      { error: 'Invalid workspace ID or workflow ID' },
      { status: 400 }
    );
  }

  try {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflow_id,
        workspace_id: workspace_id,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
