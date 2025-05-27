import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(req: Request) {
  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { workspaceId } = await req.json();
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }
    
    // Find the workspace
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    });
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    // Find active users for this workspace
    const users = await prisma_client.user.findMany({
      where: { active_workspace_id: workspaceId },
    });
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'No active users found for this workspace' }, { status: 404 });
    }
    
    // Send emails to all active users
    const results = [];
    
    for (const user of users) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/subscription-activated`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            workspaceId,
          }),
        });
        
        const result = await response.json();
        results.push({ user: user.email, result });
      } catch (error) {
        results.push({ user: user.email, error: 'Failed to send email' });
      }
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error sending subscription emails:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 