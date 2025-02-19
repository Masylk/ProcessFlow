// app/api/workspaces/subfolder-workflow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/workspaces/subfolder-workflow:
 *   post:
 *     summary: Create a new workflow within a subfolder
 *     description: Creates a new workflow within a specific subfolder of a workspace. Requires folder_id and workspace_id.
 *     tags:
 *       - Workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Workflow"
 *               description:
 *                 type: string
 *                 example: "A detailed description of the new workflow"
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *               folder_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Workflow created successfully within the subfolder
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
 *                   example: "New Workflow"
 *                 description:
 *                   type: string
 *                   example: "A detailed description of the new workflow"
 *                 workspace_id:
 *                   type: integer
 *                   example: 1
 *                 folder_id:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Name, description, workspace_id, and folder_id are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add workflow to subfolder"
 */
export async function POST(req: NextRequest) {
  try {
    const { name, description, workspace_id, folder_id } = await req.json();

    // Ensure all required fields are provided
    if (!name || !description || !workspace_id || !folder_id) {
      return NextResponse.json(
        {
          error: 'Name, description, workspace_id, and folder_id are required',
        },
        { status: 400 }
      );
    }

    // Create a new workflow inside a specific subfolder
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description, // Include the required description field
        workspace_id: Number(workspace_id),
        folder_id: Number(folder_id),
      },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error adding workflow to subfolder:', error);
    return NextResponse.json(
      { error: 'Failed to add workflow to subfolder' },
      { status: 500 }
    );
  }
}
