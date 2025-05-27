import { NextResponse } from 'next/server';
import { stripe, cancelStripeSubscription } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(req: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    // Get the user session using Supabase
    const cookieStore = cookies();
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (!session || authError) {
      return NextResponse.json(
        { error: 'Authentication required', details: authError?.message },
        { status: 401 }
      );
    }

    // Get workspace ID from the request body
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Find workspace by ID
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found', details: `No workspace found with ID ${workspaceId}` },
        { status: 404 }
      );
    }

    // Check if the workspace has a subscription
    if (!workspace.subscription) {
      return NextResponse.json(
        { error: 'No subscription found', details: 'This workspace does not have an active subscription' },
        { status: 400 }
      );
    }

    try {
      // Cancel the subscription in Stripe
      const canceledSubscription = await cancelStripeSubscription(workspace.subscription.stripe_subscription_id);
      
      // Update the subscription in the database
      await prisma_client.subscription.update({
        where: { id: workspace.subscription.id },
        data: {
          status: 'CANCELED',
          canceled_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription canceled successfully',
        subscription: {
          status: 'CANCELED',
          canceled_at: new Date(),
        },
      });
    } catch (stripeError: any) {
      console.error('Error canceling Stripe subscription:', stripeError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription', details: stripeError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Error canceling subscription', details: error.message },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 