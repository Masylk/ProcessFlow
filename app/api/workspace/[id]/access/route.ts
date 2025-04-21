import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> } // Handle params as a Promise
) {
  try {
    const params = await props.params; // Await the params
    const workspaceId = parseInt(params.id); // Convert to number

    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('userId'); // This is actually the auth_id
   

    if (!authId) {
      return new NextResponse(null, { status: 400 });
    }

    // First, find the user by auth_id
    const user = await prisma.user.findUnique({
      where: {
        auth_id: authId,
      },
    });

    if (!user) {
     
      return new NextResponse(null, { status: 404 });
    }

    // Then check workspace access using the user's id
    const userWorkspace = await prisma.user_workspace.findFirst({
      where: {
        workspace_id: workspaceId,
        user_id: user.id, // Using the actual user id here
      },
      include: {
        user: true,
      },
    });

    if (!userWorkspace) {
    
      return new NextResponse(null, { status: 403 });
    }

  
    return NextResponse.json(userWorkspace);
  } catch (error) {
    console.error('Error checking workspace access:', error);
    return new NextResponse(null, { status: 500 });
  }
}
