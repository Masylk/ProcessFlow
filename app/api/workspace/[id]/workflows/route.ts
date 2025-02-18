// app/api/workspace/[id]/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspace/{id}/workflows:
 *   get:
 *     summary: Retrieve all workflows for a specific workspace
 *     description: Fetches all workflows associated with the specified workspace by its `id`.
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace
 *     responses:
 *       200:
 *         description: Successfully retrieved workflows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Workflow Name"
 *                   description:
 *                     type: string
 *                     example: "This is a description of the workflow"
 *                   workspace_id:
 *                     type: integer
 *                     example: 1
 *       400:
 *         description: Invalid workspace ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid workspace ID"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve workflows"
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workspace_id = parseInt(params.id);
  const workflows = await prisma.workflow.findMany({
    where: {
      workspace_id,
    },
  });
  return NextResponse.json(workflows);
}
