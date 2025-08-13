import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export interface EmbeddingStatus {
  workspaceId: number;
  totalBlocks: number;
  blocksWithEmbeddings: number;
  blocksWithoutEmbeddings: number;
  completionPercentage: number;
  lastUpdated: Date | null;
}

export interface EmbeddingStats {
  totalWorkspaces: number;
  totalBlocks: number;
  totalEmbeddings: number;
  averageCompletionRate: number;
}

export class EmbeddingMonitor {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = isVercel() ? new PrismaClient() : (prisma as PrismaClient);
    if (!this.prismaClient) {
      throw new Error('Prisma client not initialized');
    }
  }

  async getWorkspaceEmbeddingStatus(workspaceId: number): Promise<EmbeddingStatus> {
    try {
      const blocks: {
        id: number;
        has_embedding: boolean;
        updated_at: Date;
      }[] = await this.prismaClient.$queryRaw`
        SELECT b.id, 
               CASE WHEN b.embedding IS NOT NULL THEN true ELSE false END as has_embedding,
               b.updated_at
        FROM block b
        JOIN workflow w ON b.workflow_id = w.id
        WHERE w.workspace_id = ${workspaceId}
      `;

      const totalBlocks = blocks.length;
      const blocksWithEmbeddings = blocks.filter(block => block.has_embedding).length;
      const blocksWithoutEmbeddings = totalBlocks - blocksWithEmbeddings;
      const completionPercentage = totalBlocks > 0 ? (blocksWithEmbeddings / totalBlocks) * 100 : 0;

      const lastUpdated = blocks
        .filter(block => block.has_embedding)
        .reduce((latest: Date | null, block) => {
          if (!latest) return block.updated_at;
          return block.updated_at > latest ? block.updated_at : latest;
        }, null);

      return {
        workspaceId,
        totalBlocks,
        blocksWithEmbeddings,
        blocksWithoutEmbeddings,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        lastUpdated,
      };
    } catch (error) {
      console.error(`Error getting embedding status for workspace ${workspaceId}:`, error);
      throw new Error(`Failed to get embedding status for workspace ${workspaceId}`);
    }
  }

  async getAllWorkspacesEmbeddingStatus(): Promise<EmbeddingStatus[]> {
    try {
      const workspaces = await this.prismaClient.workspace.findMany({
        select: {
          id: true,
        },
      });

      const statuses: EmbeddingStatus[] = [];
      
      for (const workspace of workspaces) {
        try {
          const status = await this.getWorkspaceEmbeddingStatus(workspace.id);
          statuses.push(status);
        } catch (error) {
          console.error(`Failed to get status for workspace ${workspace.id}:`, error);
          // Continue with other workspaces even if one fails
          statuses.push({
            workspaceId: workspace.id,
            totalBlocks: 0,
            blocksWithEmbeddings: 0,
            blocksWithoutEmbeddings: 0,
            completionPercentage: 0,
            lastUpdated: null,
          });
        }
      }

      return statuses;
    } catch (error) {
      console.error('Error getting all workspaces embedding status:', error);
      throw new Error('Failed to get embedding status for all workspaces');
    }
  }

  async getGlobalEmbeddingStats(): Promise<EmbeddingStats> {
    try {
      const result: { count: bigint }[] = await this.prismaClient.$queryRaw`
        SELECT COUNT(*) as count
        FROM block 
        WHERE embedding IS NOT NULL
      `;

      const totalBlocksWithEmbeddings = Number(result[0]?.count || 0);

      const totalBlocksResult = await this.prismaClient.block.aggregate({
        _count: {
          id: true,
        },
      });

      const workspacesResult = await this.prismaClient.workspace.aggregate({
        _count: {
          id: true,
        },
      });

      const totalBlocks = totalBlocksResult._count.id;
      const totalWorkspaces = workspacesResult._count.id;
      const averageCompletionRate = totalBlocks > 0 ? (totalBlocksWithEmbeddings / totalBlocks) * 100 : 0;

      return {
        totalWorkspaces,
        totalBlocks,
        totalEmbeddings: totalBlocksWithEmbeddings,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting global embedding stats:', error);
      throw new Error('Failed to get global embedding statistics');
    }
  }

  async getBlocksNeedingEmbeddings(workspaceId: number, limit: number = 100): Promise<{
    id: number;
    title: string | null;
    description: string | null;
    workflow_name: string;
    updated_at: Date;
  }[]> {
    try {
      const blocks: {
        id: number;
        title: string | null;
        description: string | null;
        workflow_name: string;
        updated_at: Date;
      }[] = await this.prismaClient.$queryRaw`
        SELECT b.id, b.title, b.description, b.updated_at, w.name as workflow_name
        FROM block b
        JOIN workflow w ON b.workflow_id = w.id
        WHERE w.workspace_id = ${workspaceId} AND b.embedding IS NULL
        ORDER BY b.updated_at DESC
        LIMIT ${limit}
      `;

      return blocks;
    } catch (error) {
      console.error(`Error getting blocks needing embeddings for workspace ${workspaceId}:`, error);
      throw new Error(`Failed to get blocks needing embeddings for workspace ${workspaceId}`);
    }
  }

  async cleanup(): Promise<void> {
    if (isVercel() && this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}

export async function logEmbeddingOperation(
  operation: 'generate' | 'reset' | 'error',
  blockId?: number,
  workspaceId?: number,
  details?: string
): Promise<void> {
  // Log embedding operations for monitoring purposes
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] EMBEDDING_${operation.toUpperCase()}`;
  
  const logDetails = [];
  if (workspaceId) logDetails.push(`workspace_id=${workspaceId}`);
  if (blockId) logDetails.push(`block_id=${blockId}`);
  if (details) logDetails.push(`details=${details}`);
  
  const fullMessage = logDetails.length > 0 
    ? `${logMessage}: ${logDetails.join(', ')}`
    : logMessage;

  console.log(fullMessage);
}