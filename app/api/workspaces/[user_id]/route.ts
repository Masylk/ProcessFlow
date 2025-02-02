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

    // If no workspaces are found, create a default one named "My Workspace"
    if (!workspaces || workspaces.length === 0) {
      // Create the default workspace
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
        },
      });

      // Create the relation linking the user with the new workspace.
      // Adjust the field names according to your Prisma schema.
      await prisma.user_workspace.create({
        data: {
          user_id: user.id,
          workspace_id: newWorkspace.id,
          role: 'ADMIN',
        },
      });

      // Return the newly created workspace inside an array for consistency.
      return NextResponse.json([newWorkspace]);
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
