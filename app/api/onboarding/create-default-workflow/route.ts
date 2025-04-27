import { NextRequest, NextResponse } from 'next/server';
import { createDefaultWorkflow } from '@/app/api/utils/create-default-workflow';

/**
 * API route to create a default workflow by duplicating an existing workflow
 * This will copy a template workflow (id: 257 from workspace: 52) to the specified workspace
 */
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, userId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    try {
      const result = await createDefaultWorkflow({ workspaceId, userId });
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error creating default workflow:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create default workflow',
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error && process.env.NODE_ENV !== 'production' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request for default workflow:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
} 