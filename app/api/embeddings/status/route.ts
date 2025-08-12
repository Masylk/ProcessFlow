import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { EmbeddingMonitor } from '@/lib/embedding/embeddingMonitor';

/**
 * @swagger
 * /api/embeddings/status:
 *   get:
 *     summary: Get embedding status for workspaces
 *     description: Returns embedding generation status and statistics for workspaces accessible to the authenticated user.
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Optional workspace ID to get status for a specific workspace
 *       - in: query
 *         name: global
 *         schema:
 *           type: boolean
 *         description: If true, returns global statistics across all workspaces
 *     responses:
 *       200:
 *         description: Embedding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspaceStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           workspaceId:
 *                             type: integer
 *                             example: 123
 *                           totalBlocks:
 *                             type: integer
 *                             example: 50
 *                           blocksWithEmbeddings:
 *                             type: integer
 *                             example: 35
 *                           blocksWithoutEmbeddings:
 *                             type: integer
 *                             example: 15
 *                           completionPercentage:
 *                             type: number
 *                             example: 70.0
 *                           lastUpdated:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                     globalStats:
 *                       type: object
 *                       properties:
 *                         totalWorkspaces:
 *                           type: integer
 *                           example: 10
 *                         totalBlocks:
 *                           type: integer
 *                           example: 500
 *                         totalEmbeddings:
 *                           type: integer
 *                           example: 350
 *                         averageCompletionRate:
 *                           type: number
 *                           example: 70.0
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve embedding status"
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const workspaceIdParam = url.searchParams.get('workspaceId');
    const globalParam = url.searchParams.get('global');

    const monitor = new EmbeddingMonitor();

    try {
      if (workspaceIdParam) {
        // Get status for specific workspace
        const workspaceId = parseInt(workspaceIdParam);
        if (isNaN(workspaceId)) {
          return NextResponse.json(
            { error: 'Invalid workspaceId parameter' },
            { status: 400 }
          );
        }

        const status = await monitor.getWorkspaceEmbeddingStatus(workspaceId);
        const needingEmbeddings = await monitor.getBlocksNeedingEmbeddings(workspaceId);

        return NextResponse.json({
          success: true,
          data: {
            workspaceStatus: [status],
            blocksNeedingEmbeddings: needingEmbeddings,
          },
        });
      }

      if (globalParam === 'true') {
        // Get global statistics
        const globalStats = await monitor.getGlobalEmbeddingStats();
        
        return NextResponse.json({
          success: true,
          data: {
            globalStats,
          },
        });
      }

      // Get status for all workspaces (default)
      const allStatuses = await monitor.getAllWorkspacesEmbeddingStatus();
      
      return NextResponse.json({
        success: true,
        data: {
          workspaceStatus: allStatuses,
        },
      });

    } finally {
      await monitor.cleanup();
    }

  } catch (error) {
    console.error('Embeddings status API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve embedding status' },
      { status: 500 }
    );
  }
}