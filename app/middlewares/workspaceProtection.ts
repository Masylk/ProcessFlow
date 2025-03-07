import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

interface User {
  id: string;
}

export async function workspaceProtection(request: NextRequest, user: User) {
  console.log('workspace protection middleware');
  
  // Handle workspace routes
  if (request.url.includes('/workspace/')) {
    const workspaceId = request.url.split('/workspace/')[1]?.split('/')[0];
    
    if (!workspaceId) {
      return NextResponse.next();
    }

    console.log('workspaceId', workspaceId);
    
    try {
      // First check if workspace exists
      const workspaceRes = await fetch(`${request.nextUrl.origin}/api/workspace/${workspaceId}`);
      
      if (!workspaceRes.ok) {
        console.log('not found');
        return NextResponse.rewrite(new URL('/not-found', request.url));
      }
      
      const workspace = await workspaceRes.json();
      console.log('workspace query result:', workspace);

      // Then check if user has access to this workspace
      const userWorkspaceRes = await fetch(
        `${request.nextUrl.origin}/api/workspace/${workspaceId}/access?userId=${user.id}`
      );

      if (!userWorkspaceRes.ok) {
        console.log('unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const userWorkspace = await userWorkspaceRes.json();
      console.log('userWorkspace query result:', userWorkspace);
    } catch (error) {
      console.error('Error in workspace protection:', error);
      return NextResponse.redirect(new URL('/error', request.url));
    }
  }

  // Handle workflow routes
  if (request.url.includes('/workflow/')) {
    const workflowId = request.url.split('/workflow/')[1]?.split('/')[0];
    
    if (!workflowId) {
      return NextResponse.next();
    }

    try {
      // Check if workflow exists and get its workspace
      const workflowRes = await fetch(`${request.nextUrl.origin}/api/workflows/${workflowId}`);
      
      if (!workflowRes.ok) {
        console.log('not found');
        return NextResponse.rewrite(new URL('/not-found', request.url));
      }

      const workflow = await workflowRes.json();

      // Check if user has access to the workflow's workspace
      const userWorkspaceRes = await fetch(
        `${request.nextUrl.origin}/api/workspace/${workflow.workspace_id}/access?userId=${user.id}`
      );

      if (!userWorkspaceRes.ok) {
        console.log('unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const userWorkspace = await userWorkspaceRes.json();
      console.log('userWorkspace query result:', userWorkspace);
    } catch (error) {
      console.error('Error in workflow protection:', error);
      return NextResponse.redirect(new URL('/error', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/workspace/:id',
    '/workspace/:id/:path*',
    '/workflow/:id',
    '/workflow/:id/:path*'
  ]
}; 