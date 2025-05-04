import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

/**
 * API route to force completion of the onboarding process
 * This is a fallback mechanism for situations where users get stuck in the onboarding flow
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log this event for monitoring
    console.warn(`User ${dbUser.id} (${dbUser.email}) is force-completing onboarding`);
    Sentry.captureMessage(`Force-completing onboarding for user ${dbUser.id}`, 'warning');

    // Get active workspace
    let activeWorkspaceId = dbUser.active_workspace_id;
    
    // If no active workspace is set, find one from user-workspace relationships
    if (!activeWorkspaceId) {
      // Query for workspaces directly via the join table
      const userWorkspaces = await prisma.user_workspace.findMany({
        where: { user_id: dbUser.id },
        orderBy: { id: 'desc' },
        take: 1,
        include: { workspace: true }
      });
      
      if (userWorkspaces.length > 0 && userWorkspaces[0].workspace_id) {
        activeWorkspaceId = userWorkspaces[0].workspace_id;
      }
    }
    
    // At this point if no workspace is available, this request is invalid
    if (!activeWorkspaceId) {
      return NextResponse.json({ 
        error: 'Cannot complete onboarding without a workspace' 
      }, { status: 400 });
    }

    // Update the user record in the database
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        onboarding_step: 'COMPLETED',
        onboarding_completed_at: new Date(),
        active_workspace_id: activeWorkspaceId,
        temp_industry: null,
        temp_company_size: null
      }
    });

    // Update Supabase user metadata
    await supabase.auth.updateUser({
      data: {
        onboarding_status: {
          current_step: 'completed',
          completed_at: new Date().toISOString()
        },
        temp_workspace_id: null // Clear temp workspace ID
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding has been marked as completed',
      activeWorkspaceId
    });
  } catch (error) {
    console.error('Error forcing onboarding completion:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to force complete onboarding' },
      { status: 500 }
    );
  }
} 