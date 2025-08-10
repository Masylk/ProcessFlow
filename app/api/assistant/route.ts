// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from "openai";

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
    const { message, conversationHistory = [] } = await req.json();

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


    // Prepare conversation context
    const systemPrompt = `You are a helpful AI assistant for ProcessFlow, a workflow and process management platform. You help users with:

1. Creating and managing workflows
2. Understanding process flows and diagrams
3. Best practices for workflow design
4. Troubleshooting workflow issues
5. General questions about the platform

Be concise, helpful, and focus on practical advice. If you don't know something specific about ProcessFlow, provide general guidance and suggest contacting support for detailed platform-specific questions.

Current user: ${userData.user.email}`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message.trim() }
    ];

    // Generate AI response
    const response = await openai.responses.create({
        model: "gpt-5",
        input: messages,
        reasoning: {
          effort: "minimal"
        }
      });

    // Extract the response content

    // Generate a unique message ID
    const messageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      response: response.output_text,
      messageId,
    });

  } catch (error) {
    console.error('Assistant API error:', error);
    
    // Don't expose internal errors to the client
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
