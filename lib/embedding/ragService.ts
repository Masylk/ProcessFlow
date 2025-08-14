import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export interface RelevantBlock {
  id: number;
  title: string | null;
  description: string | null;
  workflow_name: string;
  workflow_id: number;
  position: number;
  type: string;
  assignee: string | null;
  task_type: string | null;
  average_time: string | null;
  similarity_score: number;
  workflow_url?: string;
}

export interface RAGContext {
  relevantBlocks: RelevantBlock[];
  contextText: string;
  totalBlocks: number;
  maxSimilarity: number;
}

export interface RAGSearchOptions {
  workspaceId: number;
  maxResults?: number;
  similarityThreshold?: number;
  includeWorkflowContext?: boolean;
}

const sanitizeName = (name: string) => name.replace(/\s+/g, '-');
const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
};

export class RAGService {
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

  async embedQuery(query: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query.trim(),
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw new Error('Failed to generate embedding for query');
    }
  }

  async findSimilarBlocks(
    queryEmbedding: number[],
    options: RAGSearchOptions
  ): Promise<RelevantBlock[]> {
    const {
      workspaceId,
      maxResults = 10,
      similarityThreshold = 0.7,
    } = options;

    try {
      const queryVector = JSON.stringify(queryEmbedding);
      
      // Get all blocks with embeddings for similarity search
      const allBlocksResult: Array<{
        id: number;
        title: string | null;
        description: string | null;
        workflow_name: string;
        workflow_id: number;
        position: number;
        type: string;
        assignee: string | null;
        task_type: string | null;
        average_time: string | null;
        raw_similarity: number;
        cosine_distance: number;
      }> = await this.prismaClient.$queryRaw`
        SELECT 
          b.id,
          b.title,
          b.description,
          b.position,
          b.type,
          b.assignee,
          b.task_type,
          b.average_time,
          w.name as workflow_name,
          w.id as workflow_id,
          (b.embedding <=> ${queryVector}::vector) as cosine_distance,
          (1 - (b.embedding <=> ${queryVector}::vector)) as raw_similarity
        FROM block b
        JOIN workflow w ON b.workflow_id = w.id
        WHERE 
          w.workspace_id = ${workspaceId}
          AND b.embedding IS NOT NULL
        ORDER BY (b.embedding <=> ${queryVector}::vector)
      `;

      // Filter by threshold
      const filtered = allBlocksResult.filter(block => block.raw_similarity >= similarityThreshold);

      // Sort by highest similarity (descending)
      const sortedBySimilarity = filtered.sort((a, b) => b.raw_similarity - a.raw_similarity);

      // Group by workflow_id and count how many embeddings per workflow
      const groups = new Map<number, typeof sortedBySimilarity>();
      for (const row of sortedBySimilarity) {
        if (!groups.has(row.workflow_id)) groups.set(row.workflow_id, [] as any);
        (groups.get(row.workflow_id) as any).push(row);
      }

      // Select top `maxResults` workflows by number of embeddings
      const topWorkflowIds = Array.from(groups.entries())
        .sort((a, b) => (b[1] as any).length - (a[1] as any).length)
        .slice(0, maxResults)
        .map(([workflowId]) => workflowId);

      // Take all embeddings that belong to those top workflows, preserving similarity order
      const selectedRows = sortedBySimilarity.filter(r => topWorkflowIds.includes(r.workflow_id));

      // Fetch slug/base once
      const ws = await this.prismaClient.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });
      const baseUrl = getBaseUrl();
      const slug = ws?.slug ?? '';

      // Map the results to include similarity_score and workflow_url
      const mappedResults: RelevantBlock[] = selectedRows.map(result => ({
        ...result,
        similarity_score: Number(result.raw_similarity),
        workflow_url: slug ? `${baseUrl}/${slug}/${sanitizeName(result.workflow_name)}--pf-${result.workflow_id}/edit` : undefined,
      }));

      return mappedResults;
    } catch (error) {
      console.error('Error finding similar blocks:', error);
      throw new Error('Failed to perform vector similarity search');
    }
  }

  formatContextText(relevantBlocks: RelevantBlock[]): string {
    if (relevantBlocks.length === 0) {
      return '';
    }

    // Group blocks by workflow for better context
    const workflowGroups = new Map<number, RelevantBlock[]>();
    relevantBlocks.forEach(block => {
      if (!workflowGroups.has(block.workflow_id)) {
        workflowGroups.set(block.workflow_id, []);
      }
      workflowGroups.get(block.workflow_id)!.push(block);
    });

    const contextSections: string[] = [];
    contextSections.push('RELEVANT WORKFLOWS AND PROCESSES:');
    contextSections.push('');

    for (const [workflowId, blocks] of workflowGroups) {
      const workflowName = blocks[0].workflow_name;
      
      contextSections.push(`## Workflow: "${workflowName}"`);
      
      // Sort blocks by position within workflow
      const sortedBlocks = blocks.sort((a, b) => a.position - b.position);
      
      sortedBlocks.forEach(block => {
        const parts: string[] = [];
        parts.push(`- Step ${block.position}: ${block.title || 'Untitled Step'}`);
        
        if (block.description) {
          parts.push(`  Description: ${block.description}`);
        }
        
        const metadata: string[] = [];
        if (block.assignee) metadata.push(`Assigned: ${block.assignee}`);
        if (block.task_type) metadata.push(`Type: ${block.task_type}`);
        if (block.average_time) metadata.push(`Duration: ${block.average_time}`);
        
        if (metadata.length > 0) {
          parts.push(`  (${metadata.join(', ')})`);
        }
        
        contextSections.push(parts.join('\n'));
      });
      
      contextSections.push('');
    }

    return contextSections.join('\n');
  }

  async performRAGSearch(
    query: string,
    options: RAGSearchOptions
  ): Promise<RAGContext> {
    try {
      // Step 1: Embed the user query
      const queryEmbedding = await this.embedQuery(query);

      // Step 2: Find similar blocks
      const relevantBlocks = await this.findSimilarBlocks(queryEmbedding, options);

      // Step 3: Format context text
      const contextText = this.formatContextText(relevantBlocks);

      const maxSimilarity = relevantBlocks.length > 0 
        ? Math.max(...relevantBlocks.map(b => b.similarity_score))
        : 0;

      return {
        relevantBlocks,
        contextText,
        totalBlocks: relevantBlocks.length,
        maxSimilarity,
      };
    } catch (error) {
      console.error('Error performing RAG search:', error);
      throw new Error('Failed to perform RAG search');
    }
  }

  async cleanup(): Promise<void> {
    if (isVercel() && this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}

// Convenience function for quick RAG searches
export async function searchWorkflowContext(
  query: string,
  workspaceId: number,
  options?: Partial<RAGSearchOptions>
): Promise<RAGContext> {
  const ragService = new RAGService();
  
  try {
    return await ragService.performRAGSearch(query, {
      workspaceId,
      ...options,
    });
  } catch (error) {
    console.error('searchWorkflowContext failed:', error);
    throw error;
  } finally {
    await ragService.cleanup();
  }
}