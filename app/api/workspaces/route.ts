import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        user_workspaces: {
          include: {
            user: true, // Fetch user details for each workspace
          },
        },
      },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, user_id } = await req.json();

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the workspace and link the creator as an ADMIN
    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        user_workspaces: {
          create: {
            user_id: Number(user_id),
            role: 'ADMIN', // Assign the creator as an ADMIN
          },
        },
      },
      include: {
        user_workspaces: {
          include: {
            user: true, // Return user details with the workspace
          },
        },
      },
    });

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
