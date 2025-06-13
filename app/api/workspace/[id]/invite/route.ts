import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabaseServerClient';
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) throw new Error('Prisma client not initialized');
  try {
    const { email } = await req.json();
    // Extract workspaceId from the URL
    const url = new URL(req.url);
    const match = url.pathname.match(/\/workspace\/(\d+)\/invite/);
    const workspaceId = match ? match[1] : undefined;
    if (!email || !workspaceId) {
      return NextResponse.json({ success: false, error: 'Missing email or workspaceId' }, { status: 400 });
    }

    // Fetch workspace name
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: Number(workspaceId) },
      select: { name: true },
    });
    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    // Get inviter from Supabase session
    const supabase = createClient();
    const {
      data: { user: supaUser },
      error: supaError,
    } = await supabase.auth.getUser();
    if (supaError || !supaUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    // Find inviter in DB
    const inviter = await prisma_client.user.findUnique({ where: { email: supaUser.email } });
    if (!inviter) {
      return NextResponse.json({ success: false, error: 'Inviter not found' }, { status: 404 });
    }

    // Check if the user is already a member of the workspace
    const existingMember = await prisma_client.user_workspace.findFirst({
      where: {
        workspace_id: Number(workspaceId),
        user: { email },
      },
    });
    if (existingMember) {
      return NextResponse.json({ success: false, error: 'User is already a member of this workspace.' }, { status: 409 });
    }

    // Check for existing, non-expired invitation
    const now = new Date();
    const existingInvitation = await prisma_client.workspace_invitation.findFirst({
      where: {
        workspace_id: Number(workspaceId),
        email,
        status: 'PENDING',
        expired_at: { gt: now },
      },
    });
    if (existingInvitation) {
      return NextResponse.json({ success: false, error: 'An active invitation already exists for this email.' }, { status: 409 });
    }

    // Create new invitation (expires in 5 minutes)
    const expiredAt = new Date(now.getTime() + 5 * 60 * 1000);
    await prisma_client.workspace_invitation.create({
      data: {
        workspace_id: Number(workspaceId),
        email,
        inviter_id: inviter.id,
        status: 'PENDING',
        invited_at: now,
        expired_at: expiredAt,
      },
    });

    // Generate a simple token (base64 of email:workspaceId:timestamp)
    const tokenRaw = `${email}:${workspaceId}:${Date.now()}`;
    const token = Buffer.from(tokenRaw).toString('base64');
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://app.process-flow.io'}/join?workspace=${workspaceId}&token=${token}`;

    // Email content
    const subject = `join my workspace: ${workspace.name}`;
    const emailHtml = `
      <div style="font-family: Inter, Arial, sans-serif;">
        <h2>You've been invited to join the workspace <b>${workspace.name}</b> on ProcessFlow!</h2>
        <p>Click the button below to join:</p>
        <a href="${joinUrl}" style="display:inline-block;padding:12px 24px;background:#4761C4;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Join Workspace</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${joinUrl}">${joinUrl}</a></p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject,
      emailHtml,
      sender: 'noreply',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client?.$disconnect();
    }
  }
}
