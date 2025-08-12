import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateWorkspaceEmbeddings } from '@/lib/embedding/embeddingService';

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
    const { workspaceId } = await req.json();

    if (!workspaceId || typeof workspaceId !== 'number') {
      return NextResponse.json(
        { error: 'Valid workspaceId is required' },
        { status: 400 }
      );
    }

    console.log(`[EMBEDDINGS] User ${userData.user.email} requested embedding reset for workspace ${workspaceId}`);

    // Trigger embedding regeneration with resetExisting: true
    const result = await generateWorkspaceEmbeddings(workspaceId, { 
      resetExisting: true,
      model: 'text-embedding-3-small'
    });

    return NextResponse.json({
      success: true,
      message: 'Embeddings reset and regenerated successfully',
      result
    });

  } catch (error) {
    console.error('Embedding reset API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to reset embeddings' },
      { status: 500 }
    );
  }
}
