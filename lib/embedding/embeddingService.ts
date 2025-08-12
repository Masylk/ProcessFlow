import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { logEmbeddingOperation } from './embeddingMonitor';

interface BlockData {
  id: number;
  workflow_id: number;
  path_id: number;
  position: number;
  type: string;
  title: string | null;
  description: string | null;
  image_description: string | null;
  assignee: string | null;
  task_type: string | null;
  average_time: string | null;
}

interface WorkflowWithBlocks {
  id: number;
  name: string;
  description: string;
  blocks: BlockData[];
}

interface EmbeddingGenerationOptions {
  workspaceId: number;
  model?: string;
  resetExisting?: boolean;
}

export class EmbeddingService {
  private openai: OpenAI;
  private prismaClient: PrismaClient;

  constructor() {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    this.prismaClient = isVercel() ? new PrismaClient() : (prisma as PrismaClient);
    if (!this.prismaClient) {
      throw new Error('Prisma client not initialized');
    }
  }

  async retrieveWorkflowsInWorkspace(workspaceId: number): Promise<WorkflowWithBlocks[]> {
    try {
      const workflows = await this.prismaClient.workflow.findMany({
        where: {
          workspace_id: workspaceId,
        },
        include: {
          blocks: {
            orderBy: {
              position: 'asc',
            },
            include: {
              path: true,
            },
          },
        },
      });

      return workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        blocks: workflow.blocks.map(block => ({
          id: block.id,
          workflow_id: block.workflow_id,
          path_id: block.path_id,
          position: block.position,
          type: block.type,
          title: block.title,
          description: block.description,
          image_description: block.image_description,
          assignee: block.assignee,
          task_type: block.task_type,
          average_time: block.average_time,
        })),
      }));
    } catch (error) {
      console.error('Error retrieving workflows:', error);
      throw new Error('Failed to retrieve workflows from database');
    }
  }

  createBlockContentString(
    block: BlockData,
    workflow: WorkflowWithBlocks,
    pathName?: string
  ): string {
    const parts: string[] = [];

    parts.push(`WORKFLOW: ${workflow.name}`);
    if (workflow.description) {
      parts.push(`WORKFLOW_DESCRIPTION: ${workflow.description}`);
    }

    if (pathName) {
      parts.push(`PATH: ${pathName}`);
    }

    parts.push(`STEP_NUMBER: ${block.position}`);
    parts.push(`STEP_TYPE: ${block.type}`);

    if (block.title) {
      parts.push(`STEP_TITLE: ${block.title}`);
    }

    if (block.description) {
      parts.push(`STEP_DESCRIPTION: ${block.description}`);
    }

    if (block.image_description) {
      parts.push(`STEP_IMAGE_DESCRIPTION: ${block.image_description}`);
    }

    if (block.assignee) {
      parts.push(`ASSIGNEE: ${block.assignee}`);
    }

    if (block.task_type) {
      parts.push(`TASK_TYPE: ${block.task_type}`);
    }

    if (block.average_time) {
      parts.push(`ESTIMATED_TIME: ${block.average_time}`);
    }

    parts.push(`BLOCK_ID: ${block.id}`);
    parts.push(`WORKFLOW_ID: ${block.workflow_id}`);
    parts.push(`PATH_ID: ${block.path_id}`);

    return parts.join(' | ');
  }

  async generateEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: model,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding from OpenAI');
    }
  }

  async storeEmbedding(blockId: number, embedding: number[]): Promise<void> {
    try {
      // Normalize the embedding vector before storing
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      const normalizedEmbedding = embedding.map(val => val / magnitude);
      
      console.log(`[EMBEDDING] Storing embedding for block ${blockId}`);
      console.log(`[EMBEDDING] Original magnitude: ${magnitude.toFixed(4)}`);
      console.log(`[EMBEDDING] Normalized magnitude: ${Math.sqrt(normalizedEmbedding.reduce((sum, val) => sum + val * val, 0)).toFixed(4)}`);
      
      await this.prismaClient.$executeRaw`
        UPDATE block 
        SET embedding = ${JSON.stringify(normalizedEmbedding)}::vector,
            updated_at = NOW()
        WHERE id = ${blockId}
      `;
      
      console.log(`[EMBEDDING] Successfully stored normalized embedding for block ${blockId}`);
    } catch (error) {
      console.error(`Error storing embedding for block ${blockId}:`, error);
      throw new Error(`Failed to store embedding for block ${blockId}`);
    }
  }

  async resetBlockEmbedding(blockId: number): Promise<void> {
    try {
      await this.prismaClient.$executeRaw`
        UPDATE block 
        SET embedding = NULL, updated_at = NOW()
        WHERE id = ${blockId}
      `;
    } catch (error) {
      console.error(`Error resetting embedding for block ${blockId}:`, error);
      throw new Error(`Failed to reset embedding for block ${blockId}`);
    }
  }

  async generateEmbeddingsForWorkspace(options: EmbeddingGenerationOptions): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const { workspaceId, model = 'text-embedding-3-small', resetExisting = false } = options;
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const workflows = await this.retrieveWorkflowsInWorkspace(workspaceId);
      
      if (workflows.length === 0) {
        return { processed: 0, failed: 0, errors: ['No workflows found in workspace'] };
      }

      for (const workflow of workflows) {
        const paths = await this.prismaClient.path.findMany({
          where: { workflow_id: workflow.id },
        });

        const pathMap = new Map(paths.map(path => [path.id, path.name]));

        for (const block of workflow.blocks) {
          try {
            if (!resetExisting) {
              const existingBlocks: { count: bigint }[] = await this.prismaClient.$queryRaw`
                SELECT COUNT(*) as count FROM block WHERE id = ${block.id} AND embedding IS NOT NULL
              `;

              if (Number(existingBlocks[0]?.count || 0) > 0) {
                console.log(`[EMBEDDING] Block ${block.id} already has embedding, skipping...`);
                processed++;
                continue;
              }
            } else {
              console.log(`[EMBEDDING] Resetting existing embedding for block ${block.id}...`);
              await this.resetBlockEmbedding(block.id);
            }

            const pathName = pathMap.get(block.path_id);
            const contentString = this.createBlockContentString(block, workflow, pathName);
            
            const embedding = await this.generateEmbedding(contentString, model);
            await this.storeEmbedding(block.id, embedding);
            
            await logEmbeddingOperation('generate', block.id, workspaceId, `Generated embedding for block in workflow "${workflow.name}"`);
            processed++;
          } catch (error) {
            failed++;
            const errorMessage = `Block ${block.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMessage);
            await logEmbeddingOperation('error', block.id, workspaceId, errorMessage);
            console.error(errorMessage, error);
          }
        }
      }

      return { processed, failed, errors };
    } catch (error) {
      const errorMessage = `Fatal error processing workspace ${workspaceId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      console.error(errorMessage, error);
      return { processed, failed, errors };
    }
  }

  async cleanup(): Promise<void> {
    if (isVercel() && this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}

export async function generateWorkspaceEmbeddings(
  workspaceId: number,
  options?: Partial<EmbeddingGenerationOptions>
): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}> {
  const embeddingService = new EmbeddingService();
  
  try {
    const result = await embeddingService.generateEmbeddingsForWorkspace({
      workspaceId,
      ...options,
    });

    return {
      success: result.failed === 0,
      ...result,
    };
  } finally {
    await embeddingService.cleanup();
  }
}