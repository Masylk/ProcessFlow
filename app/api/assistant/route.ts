// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from "openai";
import { generateWorkspaceEmbeddings } from '@/lib/embedding/embeddingService';
import { searchWorkflowContext } from '@/lib/embedding/ragService';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/assistant:
 *   post:
 *     summary: Send a message to the AI assistant
 *     description: Sends a user message to the AI assistant and returns a generated response using OpenAI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message to send to the assistant.
 *                 example: "How can I create a new workflow?"
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *                 description: Optional conversation history for context.
 *                 example: [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi! How can I help you?"}]
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "I can help you create a new workflow! Here's how..."
 *                 messageId:
 *                   type: string
 *                   example: "ai-1234567890"
 *       400:
 *         description: Missing or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Message is required"
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
 *                   example: "Failed to generate AI response"
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const { message, conversationHistory = [], workspaceId } = await req.json();

    // Keep only the last 10 previous messages for context
    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-10)
      : [];

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI();

    // Ensure embeddings are generated BEFORE running RAG
    if (workspaceId && typeof workspaceId === 'number') {
      try {
        await generateWorkspaceEmbeddings(workspaceId, { resetExisting: false });
      } catch (error) {
        console.error('Embedding generation failed before RAG:', error);
        // Continue without blocking; RAG will return no results if none exist
      }
    }

    // Perform RAG search if workspaceId is provided
    let ragContext = '';
    let relevantSources: any[] = [];
    let labeledSources: any[] = [];
    
    if (workspaceId && typeof workspaceId === 'number') {
      try {
        const ragResult = await searchWorkflowContext(message.trim(), workspaceId, {
          maxResults: 5,
          similarityThreshold: 0,
        });

        if (ragResult.relevantBlocks.length > 0) {
          // Label sources S1, S2, ...
          labeledSources = ragResult.relevantBlocks.map((s, i) => ({
            label: `S${i + 1}`,
            ...s,
          }));

          // Build a concise labeled sources list for the prompt
          const sourcesList = labeledSources
            .map(s => `[${s.label}] Workflow: ${s.workflow_name} | Step ${s.position}: ${s.title || 'Untitled'}${s.description ? ` | ${s.description}` : ''}`)
            .join('\n');

          // Create RAG context with citation instruction
          ragContext = `${sourcesList}`;
        }
      } catch (error) {
        console.error('RAG search failed:', error);
        // Continue without RAG context
      }
    }

    // Prepare enhanced system prompt with RAG context
    let systemPrompt = `You are a helpful AI assistant for ProcessFlow, a workflow and process management platform. You help users with:

1. Creating and managing workflows
2. Understanding process flows and diagrams
3. Best practices for workflow design
4. Troubleshooting workflow issues
5. General questions about the platform

Current user: ${userData.user.email}`;

    // Add RAG context to system prompt if available
    if (ragContext) {
      systemPrompt += `

IMPORTANT: You also have access to the user's actual workflows and processes. Below is a list of labeled sources. When you use any info from them, append the label(s) immediately after the sentence like [S1] or [S1,S3]. Only use labels present below.

${ragContext}

When answering:
- Reference specific workflows and steps by adding citation labels (e.g., [S1]) right after the relevant sentence
- Provide concrete examples from their actual processes
- Suggest improvements or modifications to existing workflows when appropriate
- If a statement isn't supported by listed sources, do not add a label`;
    } else {
      systemPrompt += `

Be concise, helpful, and focus on practical advice. If you don't know something specific about ProcessFlow, provide general guidance and suggest contacting support for detailed platform-specific questions.`;
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message.trim() }
    ];

    // Non-streaming single response (GPT-5)
    const completion: any = await (openai as any).responses.create({
      model: 'gpt-5-nano-2025-08-07',
      input: messages as any,
      reasoning: { effort: 'medium' },
      text: { verbosity: 'low' },
    });

    // Extract text from responses API
    const parts = completion?.output || completion?.choices || [];
    const content = Array.isArray(parts)
      ? parts
          .map((p: any) =>
            p?.content
              ? p.content
                  .filter((c: any) => c.type === 'output_text')
                  .map((c: any) => c.text)
                  .join('')
              : p?.message?.content || ''
          )
          .join('')
      : '';

    const messageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const responseData: any = {
      success: true,
      response: content || 'Sorry, I could not generate a response.',
      messageId,
    };

    if (labeledSources.length > 0) {
      responseData.sources = labeledSources.map(source => ({
        label: source.label,
        workflow_name: source.workflow_name,
        workflow_id: source.workflow_id,
        step_title: source.title,
        step_position: source.position,
        similarity_score: Math.round(source.similarity_score * 100) / 100,
        workflow_url: source.workflow_url,
      }));
      responseData.context_used = true;
      responseData.total_sources = labeledSources.length;
    } else {
      responseData.context_used = false;
      responseData.total_sources = 0;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Assistant API error:', error);
    
    // Don't expose internal errors to the client
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
