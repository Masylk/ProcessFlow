// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const workspaces = await prisma.workspace.findMany();
  return NextResponse.json(workspaces);
}

export async function POST(req: NextRequest) {
  try {
    const { name, team_id } = await req.json();

    // Check if the team exists
    const team = await prisma.team.findUnique({
      where: { id: Number(team_id) },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        team_id: Number(team_id),
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
