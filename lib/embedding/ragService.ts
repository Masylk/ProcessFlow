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
      console.log(`[RAG] Generating embedding for query: "${query.trim()}"`);
      console.log(`[RAG] Using model: text-embedding-3-small`);
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query.trim(),
      });

      const embedding = response.data[0].embedding;
      console.log(`[RAG] OpenAI embedding generated successfully. Vector dimensions: ${embedding.length}`);
      
      return embedding;
    } catch (error) {
      console.error('[RAG] Error generating query embedding:', error);
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
      console.log(`[RAG] Starting similarity search for workspace ${workspaceId}`);
      console.log(`[RAG] Search parameters: maxResults=${maxResults}, similarityThreshold=${similarityThreshold}`);
      
      const queryVector = JSON.stringify(queryEmbedding);
      console.log(`[RAG] Query embedding generated, vector length: ${queryEmbedding.length}`);
      
      // First, get total count of blocks with embeddings in this workspace
      const totalBlocksResult: { count: bigint }[] = await this.prismaClient.$queryRaw`
        SELECT COUNT(*) as count
        FROM block b
        JOIN workflow w ON b.workflow_id = w.id
        WHERE w.workspace_id = ${workspaceId} AND b.embedding IS NOT NULL
      `;
      
      const totalBlocksWithEmbeddings = Number(totalBlocksResult[0]?.count || 0);
      console.log(`[RAG] Total blocks with embeddings in workspace ${workspaceId}: ${totalBlocksWithEmbeddings}`);
      
      if (totalBlocksWithEmbeddings === 0) {
        console.log(`[RAG] No blocks with embeddings found in workspace ${workspaceId}`);
        return [];
      }
      
      // Perform the similarity search
      console.log(`[RAG] Executing vector similarity query...`);
      
      // First, get ALL blocks with embeddings to see what we're working with
      console.log(`[RAG] Getting all blocks with embeddings for detailed analysis...`);
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
           (b.embedding <-> ${queryVector}::vector) as cosine_distance,
           (1 - (b.embedding <-> ${queryVector}::vector)) as raw_similarity
         FROM block b
         JOIN workflow w ON b.workflow_id = w.id
         WHERE 
           w.workspace_id = ${workspaceId}
           AND b.embedding IS NOT NULL
         ORDER BY (b.embedding <-> ${queryVector}::vector)
       `;

      console.log(`[RAG] === DETAILED SIMILARITY ANALYSIS ===`);
      console.log(`[RAG] Total blocks analyzed: ${allBlocksResult.length}`);
      console.log(`[RAG] Similarity threshold: ${similarityThreshold} (${(similarityThreshold * 100).toFixed(1)}%)`);
      console.log(`[RAG] Query vector dimensions: ${queryEmbedding.length}`);
      console.log(`[RAG] Threshold type: ${typeof similarityThreshold}, Value: ${similarityThreshold}`);
      console.log(`[RAG] 0% threshold check: ${similarityThreshold === 0 ? 'YES - Should include ALL blocks' : 'NO'}`);
      
             // Log detailed comparison for each block
       console.log(`[RAG] === COSINE DISTANCE ANALYSIS ===`);
       console.log(`[RAG] Expected cosine distance range: 0.0 to 2.0`);
       console.log(`[RAG] Expected similarity range: -1.0 to 1.0`);
       
       // Analyze the cosine distance ranges
       const minDistance = Math.min(...allBlocksResult.map(b => b.cosine_distance));
       const maxDistance = Math.max(...allBlocksResult.map(b => b.cosine_distance));
       const avgDistance = allBlocksResult.reduce((sum, b) => sum + b.cosine_distance, 0) / allBlocksResult.length;
       
       console.log(`[RAG] Cosine Distance Summary:`);
       console.log(`  Min: ${minDistance.toFixed(4)}`);
       console.log(`  Max: ${maxDistance.toFixed(4)}`);
       console.log(`  Avg: ${avgDistance.toFixed(4)}`);
       console.log(`  Range: ${(maxDistance - minDistance).toFixed(4)}`);
       console.log(`  All values valid: ${allBlocksResult.every(b => b.cosine_distance >= 0 && b.cosine_distance <= 2)}`);
       
       // Analyze vector properties
       console.log(`[RAG] === VECTOR PROPERTIES ANALYSIS ===`);
       console.log(`[RAG] Query vector dimensions: ${queryEmbedding.length}`);
       console.log(`[RAG] Query vector sample values: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
       
       // Check if vectors are normalized
       const queryMagnitude = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
       console.log(`[RAG] Query vector magnitude: ${queryMagnitude.toFixed(4)} (should be ~1.0 for normalized vectors)`);
       
       if (Math.abs(queryMagnitude - 1.0) > 0.1) {
         console.log(`[RAG] ⚠️  Query vector is NOT normalized! This could cause similarity issues.`);
       }
       
       allBlocksResult.forEach((block, index) => {
         const similarityPercent = (block.raw_similarity * 100).toFixed(2);
         const distancePercent = (block.cosine_distance * 100).toFixed(2);
         const meetsThreshold = block.raw_similarity >= similarityThreshold;
         const status = meetsThreshold ? '✅ INCLUDED' : '❌ EXCLUDED';
         
         // Check for invalid cosine distance values
         const distanceValid = block.cosine_distance >= 0 && block.cosine_distance <= 2;
         const distanceWarning = !distanceValid ? '⚠️ INVALID DISTANCE' : '';
         
         console.log(`[RAG] Block ${index + 1}: ${status} ${distanceWarning}`);
         console.log(`  ID: ${block.id}, Workflow: "${block.workflow_name}", Step: ${block.position}`);
         console.log(`  Title: ${block.title || 'Untitled'}`);
         console.log(`  Cosine Distance: ${block.cosine_distance.toFixed(4)} (${distancePercent}%) ${distanceValid ? '' : '❌ OUT OF RANGE'}`);
         console.log(`  Raw Similarity: ${block.raw_similarity.toFixed(4)} (${similarityPercent}%)`);
         console.log(`  Threshold Check: ${block.raw_similarity} >= ${similarityThreshold} = ${meetsThreshold}`);
         console.log(`  ---`);
       });

             // Now filter by threshold
       console.log(`[RAG] === FILTERING RESULTS ===`);
       console.log(`[RAG] Filtering logic: block.raw_similarity >= ${similarityThreshold}`);
       
       // Add alternative similarity calculation for debugging
       console.log(`[RAG] === ALTERNATIVE SIMILARITY CALCULATIONS ===`);
       allBlocksResult.forEach((block, index) => {
         // Standard cosine similarity (1 - distance)
         const standardSimilarity = 1 - block.cosine_distance;
         
         // Alternative: treat distance > 1 as "very different" and map to negative
         const altSimilarity = block.cosine_distance > 1 ? -(block.cosine_distance - 1) : (1 - block.cosine_distance);
         
         console.log(`[RAG] Block ${block.id} Alternative Calculations:`);
         console.log(`  Standard: 1 - ${block.cosine_distance.toFixed(4)} = ${standardSimilarity.toFixed(4)}`);
         console.log(`  Alternative: ${altSimilarity.toFixed(4)}`);
         console.log(`  ---`);
       });
       
       const results = allBlocksResult.filter(block => {
         const meetsThreshold = block.raw_similarity >= similarityThreshold;
         console.log(`[RAG] Block ${block.id}: ${block.raw_similarity} >= ${similarityThreshold} = ${meetsThreshold}`);
         return meetsThreshold;
       });
      
      console.log(`[RAG] Blocks meeting threshold ${similarityThreshold}: ${results.length}/${allBlocksResult.length}`);
      
      if (results.length === 0) {
        console.log(`[RAG] ⚠️  NO BLOCKS MEET THRESHOLD!`);
        console.log(`[RAG] This suggests either:`);
        console.log(`[RAG]   1. All similarity scores are below ${similarityThreshold}`);
        console.log(`[RAG]   2. There's an issue with the similarity calculation`);
        console.log(`[RAG]   3. The threshold logic needs adjustment`);
        
        // Show the highest similarity scores for debugging
        const topScores = allBlocksResult.slice(0, 5);
        console.log(`[RAG] Top 5 similarity scores:`);
        topScores.forEach((block, index) => {
          console.log(`  ${index + 1}. Block ${block.id}: ${(block.raw_similarity * 100).toFixed(2)}%`);
        });
      }

      console.log(`[RAG] Vector search completed. Found ${results.length} blocks above similarity threshold ${similarityThreshold}`);
      
      // Log details about each result
      if (results.length > 0) {
        console.log(`[RAG] Top results:`);
        results.forEach((result, index) => {
          console.log(`  ${index + 1}. Block ${result.id} (${result.workflow_name} - Step ${result.position})`);
          console.log(`     Title: ${result.title || 'Untitled'}`);
          console.log(`     Similarity: ${(result.raw_similarity * 100).toFixed(1)}%`);
        });
      } else {
        console.log(`[RAG] No blocks met the similarity threshold. Consider lowering the threshold or checking if embeddings exist.`);
      }

      return results.map(result => ({
        ...result,
        similarity_score: Number(result.raw_similarity),
      }));
    } catch (error) {
      console.error('[RAG] Error finding similar blocks:', error);
      throw new Error('Failed to perform vector similarity search');
    }
  }

  formatContextText(relevantBlocks: RelevantBlock[]): string {
    console.log(`[RAG] Formatting context text for ${relevantBlocks.length} blocks`);
    
    if (relevantBlocks.length === 0) {
      console.log(`[RAG] No blocks to format, returning empty context`);
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

    console.log(`[RAG] Grouped blocks into ${workflowGroups.size} workflows`);

    const contextSections: string[] = [];
    contextSections.push('RELEVANT WORKFLOWS AND PROCESSES:');
    contextSections.push('');

    for (const [workflowId, blocks] of workflowGroups) {
      const workflowName = blocks[0].workflow_name;
      console.log(`[RAG] Processing workflow: "${workflowName}" with ${blocks.length} relevant blocks`);
      
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

    const finalContext = contextSections.join('\n');
    console.log(`[RAG] Context text formatting completed. Final length: ${finalContext.length} characters`);
    
    return finalContext;
  }

  async performRAGSearch(
    query: string,
    options: RAGSearchOptions
  ): Promise<RAGContext> {
    try {
      console.log(`[RAG] ===== Starting RAG search =====`);
      console.log(`[RAG] Query: "${query}"`);
      console.log(`[RAG] Workspace ID: ${options.workspaceId}`);
      console.log(`[RAG] Options:`, options);
      
      // Step 1: Embed the user query
      console.log(`[RAG] Step 1: Generating query embedding...`);
      const queryEmbedding = await this.embedQuery(query);
      console.log(`[RAG] Query embedding completed. Vector dimensions: ${queryEmbedding.length}`);

      // Step 2: Find similar blocks
      console.log(`[RAG] Step 2: Finding similar blocks...`);
      const relevantBlocks = await this.findSimilarBlocks(queryEmbedding, options);
      console.log(`[RAG] Similarity search completed. Found ${relevantBlocks.length} relevant blocks`);

      // Step 3: Format context text
      console.log(`[RAG] Step 3: Formatting context text...`);
      const contextText = this.formatContextText(relevantBlocks);
      console.log(`[RAG] Context text formatted. Length: ${contextText.length} characters`);

      const maxSimilarity = relevantBlocks.length > 0 
        ? Math.max(...relevantBlocks.map(b => b.similarity_score))
        : 0;

      console.log(`[RAG] ===== RAG search completed =====`);
      console.log(`[RAG] Final results: ${relevantBlocks.length} blocks, max similarity: ${(maxSimilarity * 100).toFixed(1)}%`);
      console.log(`[RAG] Context text preview: ${contextText.substring(0, 200)}${contextText.length > 200 ? '...' : ''}`);

      return {
        relevantBlocks,
        contextText,
        totalBlocks: relevantBlocks.length,
        maxSimilarity,
      };
    } catch (error) {
      console.error('[RAG] Error performing RAG search:', error);
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
  console.log(`[RAG] ===== searchWorkflowContext called =====`);
  console.log(`[RAG] Query: "${query}"`);
  console.log(`[RAG] Workspace ID: ${workspaceId}`);
  console.log(`[RAG] Options:`, options);
  
  const ragService = new RAGService();
  
  try {
    const result = await ragService.performRAGSearch(query, {
      workspaceId,
      ...options,
    });
    
    console.log(`[RAG] searchWorkflowContext completed successfully`);
    console.log(`[RAG] Returning ${result.relevantBlocks.length} relevant blocks`);
    
    return result;
  } catch (error) {
    console.error(`[RAG] searchWorkflowContext failed:`, error);
    throw error;
  } finally {
    await ragService.cleanup();
    console.log(`[RAG] RAGService cleaned up`);
  }
}