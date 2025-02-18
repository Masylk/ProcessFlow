// app/api/workflow/updateLastOpened/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to where you initialize Prisma in your project

/**
 * @swagger
 * /api/workflow/updateLastOpened:
 *   patch:
 *     summary: Update the last opened timestamp of a workflow
 *     description: Updates the `last_opened` field of a workflow to the current timestamp.
 *     tags:
 *       - Workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workflowId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully updated the last opened timestamp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Last opened updated"
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     last_opened:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-16T12:34:56.789Z"
 *       400:
 *         description: Missing workflow ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing workflowId"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function PATCH(req: NextRequest) {
  try {
    const { workflowId } = await req.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Missing workflowId' },
        { status: 400 }
      );
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: { last_opened: new Date() },
    });

    return NextResponse.json({
      message: 'Last opened updated',
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Error updating last_opened:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
