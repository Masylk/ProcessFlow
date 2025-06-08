import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const name = searchParams.get('name');

  if (!user_id || !name) {
    return NextResponse.json({ error: 'Missing user_id or name parameter' }, { status: 400 });
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        name,
        user_workspaces: {
          some: {
            user_id: parseInt(user_id, 10),
          },
        },
      },
      include: {
        user_workspaces: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    return NextResponse.json(workspace, { status: 200 });
  } catch (error) {
    console.error('Error fetching workspace by name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
