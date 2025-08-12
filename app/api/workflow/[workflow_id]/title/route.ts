// app/api/workflow/[workflow_id]/title/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to where you initialize Prisma in your project
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

/**
 * @swagger
 * /api/workflow/{workflow_id}/title:
 *   get:
 *     summary: Get workflow title
 *     description: Fetches the title of a workflow by its ID.
 *     tags:
 *       - Workflow
 *     parameters:
 *       - in: path
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workflow
 *     responses:
 *       200:
 *         description: Successfully retrieved workflow title.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Project Alpha"
 *       400:
 *         description: Invalid workflow ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid workflow ID"
 *       404:
 *         description: Workflow not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workflow not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *
 *   put:
 *     summary: Update workflow title
 *     description: Updates the title of a workflow by its ID.
 *     tags:
 *       - Workflow
 *     parameters:
 *       - in: path
 *         name: workflow_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Workflow Title"
 *     responses:
 *       200:
 *         description: Successfully updated workflow title.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "New Workflow Title"
 *       400:
 *         description: Invalid workflow ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid workflow ID"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function GET(req: Request, props: { params: Promise<{ workflow_id: string }> }) {
  const params = await props.params;
  const workflow_id = parseInt(params.workflow_id);

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  if (isNaN(workflow_id)) {
    return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
  }

  try {
    const workflow = await prisma_client.workflow.findUnique({
      where: {
        id: workflow_id,
      },
      select: {
        name: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ title: workflow.name });
  } catch (error) {
    console.error('Error fetching workflow title:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

export async function PUT(req: Request, props: { params: Promise<{ workflow_id: string }> }) {
  const params = await props.params;
  const workflow_id = parseInt(params.workflow_id);
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  if (isNaN(workflow_id)) {
    return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
  }

  try {
    const { title } = await req.json();

    const updatedWorkflow = await prisma_client.workflow.update({
      where: {
        id: workflow_id,
      },
      data: {
        name: title,
      },
    });

    return NextResponse.json({ title: updatedWorkflow.name });
  } catch (error) {
    console.error('Error updating workflow title:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
