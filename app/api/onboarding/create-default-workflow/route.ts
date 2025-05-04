import { NextResponse } from 'next/server';
import { createDefaultWorkflow } from '@/app/api/utils/create-default-workflow';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * API route to create a default workflow by duplicating an existing workflow
 * This will copy a template workflow (id: 257 from workspace: 52) to the specified workspace
 */
export async function POST() {
  try {
    // Get the Supabase client
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the user's workspace
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (workspaceError || !workspaces || workspaces.length === 0) {
      return NextResponse.json(
        { error: 'No workspace found for user' },
        { status: 404 }
      );
    }
    
    // Convert to number type to match the expected interface
    const workspaceId = Number(workspaces[0].id);
    const userId = Number(user.id);
    
    // Create the default workflow
    const result = await createDefaultWorkflow({ workspaceId, userId });
    
    if (!result || !result.success || (result.warnings && result.warnings.length > 0)) {
      return NextResponse.json(
        { 
          error: 'Failed to create default workflow',
          warnings: result?.warnings 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      workflowId: result.workflow.id 
    });
  } catch (error) {
    console.error('Error creating default workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create default workflow' },
      { status: 500 }
    );
  }
} 