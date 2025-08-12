import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { isVercel } from '../../utils/isVercel';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
    const prisma_client = isVercel() ? new PrismaClient() : prisma;
    if (!prisma_client) {
        throw new Error('Prisma client not initialized');
    }
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId || typeof workspaceId !== 'number') {
      return NextResponse.json({ error: 'Invalid workspaceId' }, { status: 400 });
    }

    // Get the authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in the database
    const dbUser = await prisma_client.user.findUnique({
      where: { email: user.email },
      include: { workspaces: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is a member of the workspace
    const isMember = dbUser.workspaces.some(
      (uw) => uw.workspace_id === workspaceId
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: Not a member of this workspace' }, { status: 403 });
    }

    // Update the user's active_workspace_id
    await prisma_client.user.update({
      where: { id: dbUser.id },
      data: { active_workspace_id: workspaceId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error switching workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}
