import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabaseServerClient';
import { isVercel } from '../utils/isVercel';
import { PrismaClient } from '@prisma/client';

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) throw new Error('Prisma client not initialized');
  try {
    const { workspace, token } = await req.json();
    if (!workspace || !token) {
      return NextResponse.json({ success: false, error: 'Missing workspace or token' }, { status: 400 });
    }

    // Decode token: base64 of email:workspaceId:timestamp
    let decoded;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }
    const [email, workspaceId, timestamp] = decoded.split(':');
    if (!email || workspaceId !== workspace) {
      return NextResponse.json({ success: false, error: 'Token does not match workspace' }, { status: 400 });
    }

    // Get current user from Supabase session
    const supabase = createClient();
    const {
      data: { user: supaUser },
      error: supaError,
    } = await supabase.auth.getUser();
    if (supaError || !supaUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Find user in DB by email (should match supaUser.email)
    const dbUser = await prisma_client.user.findUnique({ where: { email: supaUser.email } });
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user_workspace already exists
    const existing = await prisma_client.user_workspace.findFirst({
      where: { user_id: dbUser.id, workspace_id: Number(workspace) },
    });
    if (!existing) {
      await prisma_client.user_workspace.create({
        data: {
          user_id: dbUser.id,
          workspace_id: Number(workspace),
          role: 'EDITOR', // Default role, adjust as needed
        },
      });
    }

    // Set as active workspace
    await prisma_client.user.update({
      where: { id: dbUser.id },
      data: { active_workspace_id: Number(workspace) },
    });

    // Find invitation for this email and workspace
    const invitation = await prisma_client.workspace_invitation.findFirst({
      where: {
        workspace_id: Number(workspace),
        email: supaUser.email,
        status: 'PENDING',
      },
    });
    if (!invitation) {
      return NextResponse.json({ success: false, error: 'No valid invitation found.' }, { status: 404 });
    }
    const now = new Date();
    if (invitation.expired_at && now > invitation.expired_at) {
      await prisma_client.workspace_invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ success: false, error: 'Invitation expired.' }, { status: 410 });
    }
    // Mark invitation as accepted
    await prisma_client.workspace_invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', accepted_at: now },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join workspace error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client?.$disconnect();
    }
  }
}