import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { createStripePortalSession } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(request: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { workspaceId } = await request.json();

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get workspace and verify user has access
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      include: { user_workspaces: {
        include: { user: true }
      }}
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const hasAccess = workspace.user_workspaces.some(uw => uw.user.auth_id === user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!workspace.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
    }

    // Create Stripe Portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    const returnUrl = `${baseUrl}/`;
    const session = await createStripePortalSession({
      customerId: workspace.stripe_customer_id,
      returnUrl
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 