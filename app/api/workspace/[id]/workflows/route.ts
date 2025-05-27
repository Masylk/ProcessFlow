// app/api/workspace/[id]/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

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
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const workspace_id = parseInt(params.id);
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const workflows = await prisma_client.workflow.findMany({
      where: {
        workspace_id,
      },
    });
    return NextResponse.json(workflows);
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
