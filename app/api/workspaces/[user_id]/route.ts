import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const userId = parseInt(params.user_id); // Use the user_id from the URL

  try {
    // Fetch the user and their workspaces based on user_id
    const user = await prisma.user.findUnique({
      where: {
        id: userId, // Query by user_id
      },
      include: {
        user_workspaces: {
          include: {
            workspace: true, // Include related workspaces
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract workspaces from the user_workspaces relation
    const workspaces = user.user_workspaces.map((uw) => uw.workspace);

    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json(
        { error: 'No workspaces found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
