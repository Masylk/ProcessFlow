import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateWorkspaceEmbeddings } from '@/lib/embedding/embeddingService';

/**
 * @swagger
 * /api/embeddings/generate:
 *   post:
 *     summary: Generate embeddings for all blocks in a workspace
 *     description: Triggers the embedding generation process for all workflows and blocks in the specified workspace.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workspaceId:
 *                 type: integer
 *                 description: The ID of the workspace to generate embeddings for.
 *                 example: 123
 *               model:
 *                 type: string
 *                 description: The OpenAI embedding model to use (optional).
 *                 default: "text-embedding-3-small"
 *                 example: "text-embedding-3-small"
 *               resetExisting:
 *                 type: boolean
 *                 description: Whether to regenerate embeddings for blocks that already have them.
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Embedding generation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 processed:
 *                   type: integer
 *                   example: 25
 *                 failed:
 *                   type: integer
 *                   example: 0
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 message:
 *                   type: string
 *                   example: "Successfully generated embeddings for 25 blocks"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "workspaceId is required"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       403:
 *         description: User does not have access to this workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied to workspace"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate embeddings"
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { workspaceId, model, resetExisting } = await req.json();

    if (!workspaceId || typeof workspaceId !== 'number') {
      return NextResponse.json(
        { error: 'workspaceId is required and must be a number' },
        { status: 400 }
      );
    }

    const result = await generateWorkspaceEmbeddings(workspaceId, {
      model,
      resetExisting,
    });

    const message = result.success
      ? `Successfully generated embeddings for ${result.processed} blocks`
      : `Generated embeddings for ${result.processed} blocks, ${result.failed} failed`;

    return NextResponse.json({
      ...result,
      message,
    });

  } catch (error) {
    console.error('Embeddings generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}