import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';
import getBaseUrl from '../utils/getBaseUrl';

interface User {
  id: string;
}

const isDevelopment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

export async function workspaceProtection(request: NextRequest, user: User) {
  if (isDevelopment) {
    console.log('workspace protection middleware');
  }

  // Handle new workflow routes: [slug]/[workflow name]--pf-[workflowId]/edit or /read
  try {
    const urlObj = new URL(request.url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Look for a segment that contains '--pf-'
    const workflowSegment = pathParts.find(part => part.includes('--pf-'));
    const isEditOrRead = pathParts.some(part => part === 'edit' || part === 'read');

    if (workflowSegment && isEditOrRead) {
      // Extract workflowId from the segment
      const match = workflowSegment.match(/--pf-(.+)$/);
      const workflowId = match ? match[1] : null;

      if (!workflowId) {
        return NextResponse.next();
      }

      try {
        // Check if workflow exists and get its workspace
        console.log('getBaseUrl(): ', getBaseUrl());
        const workflowRes = await fetch(`${getBaseUrl()}/api/workflow/${workflowId}`);

        // if (!workflowRes.ok) {
        //   console.log('workflow not found');
        //   return NextResponse.rewrite(new URL('/not-found', request.url));
        // }

        console.log('workflowRes: ', workflowRes);
        const workflow = await workflowRes.json();

        console.log('workflow: ', workflow);
        // Check if user has access to the workflow's workspace
        const userWorkspaceRes = await fetch(
          `${getBaseUrl()}/api/workspace/${workflow.workspace_id}/access?userId=${user.id}`
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
    }
  } catch (parseError) {
    if (isDevelopment) {
      console.error('Error parsing URL in workflow protection:', parseError);
    }
    return NextResponse.redirect(new URL('/error', request.url));
  }

  return NextResponse.next();
}
