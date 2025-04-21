import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

interface User {
  id: string;
}

const isDevelopment = process.env.NODE_ENV !== 'production';

export async function workspaceProtection(request: NextRequest, user: User) {
  if (isDevelopment) {
    console.log('workspace protection middleware');
  }
  
  // Handle workspace routes with more robust URL parsing
  if (request.url.includes('/workspace/')) {
    // Use URL parsing instead of string splitting for more reliability
    try {
      const urlObj = new URL(request.url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // The workspace ID should be the second element after 'workspace'
      const workspaceIndex = pathParts.findIndex(part => part === 'workspace');
      if (workspaceIndex === -1 || workspaceIndex + 1 >= pathParts.length) {
        return NextResponse.next();
      }
      
      const workspaceId = pathParts[workspaceIndex + 1];
      
      if (!workspaceId) {
        return NextResponse.next();
      }

      if (isDevelopment) {
        console.log('workspaceId', workspaceId);
      }
      
      try {
        // First check if workspace exists
        const workspaceRes = await fetch(`${request.nextUrl.origin}/api/workspace/${workspaceId}`);
        
        if (!workspaceRes.ok) {
          if (isDevelopment) {
            console.log('not found');
          }
          return NextResponse.rewrite(new URL('/not-found', request.url));
        }
        
        const workspace = await workspaceRes.json();
        if (isDevelopment) {
          console.log('workspace query result:', workspace);
        }

        // Then check if user has access to this workspace
        const userWorkspaceRes = await fetch(
          `${request.nextUrl.origin}/api/workspace/${workspaceId}/access?userId=${user.id}`
        );

        if (!userWorkspaceRes.ok) {
          if (isDevelopment) {
            console.log('unauthorized');
          }
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        const userWorkspace = await userWorkspaceRes.json();
        if (isDevelopment) {
          console.log('userWorkspace query result:', userWorkspace);
        }
      } catch (error) {
        if (isDevelopment) {
          console.error('Error in workspace protection:', error);
        }
        return NextResponse.redirect(new URL('/error', request.url));
      }
    } catch (parseError) {
      if (isDevelopment) {
        console.error('Error parsing URL in workspace protection:', parseError);
      }
      return NextResponse.redirect(new URL('/error', request.url));
    }
  }

  // Handle workflow routes with more robust URL parsing
  if (request.url.includes('/workflow/')) {
    try {
      const urlObj = new URL(request.url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // The workflow ID should be the second element after 'workflow'
      const workflowIndex = pathParts.findIndex(part => part === 'workflow');
      if (workflowIndex === -1 || workflowIndex + 1 >= pathParts.length) {
        return NextResponse.next();
      }
      
      const workflowId = pathParts[workflowIndex + 1];
      
      if (!workflowId) {
        return NextResponse.next();
      }

      try {
        // Check if workflow exists and get its workspace
        const workflowRes = await fetch(`${request.nextUrl.origin}/api/workflows/${workflowId}`);
        
        if (!workflowRes.ok) {
          return NextResponse.rewrite(new URL('/not-found', request.url));
        }

        const workflow = await workflowRes.json();

        // Check if user has access to the workflow's workspace
        const userWorkspaceRes = await fetch(
          `${request.nextUrl.origin}/api/workspace/${workflow.workspace_id}/access?userId=${user.id}`
        );

        if (!userWorkspaceRes.ok) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        const userWorkspace = await userWorkspaceRes.json();
        if (isDevelopment) {
          console.log('userWorkspace query result:', userWorkspace);
        }
      } catch (error) {
        if (isDevelopment) {
          console.error('Error in workflow protection:', error);
        }
        return NextResponse.redirect(new URL('/error', request.url));
      }
    } catch (parseError) {
      if (isDevelopment) {
        console.error('Error parsing URL in workflow protection:', parseError);
      }
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