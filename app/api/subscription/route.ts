import { NextResponse } from 'next/server';
import { stripe, createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { subscriptionRateLimiter } from '@/lib/rateLimit';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface UserWorkspace {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

interface WorkspaceWithDetails {
  id: number;
  subscription: {
    stripe_subscription_id: string;
    plan_type: string;
    status: string;
    current_period_end: Date;
  } | null;
  user_workspaces: UserWorkspace[];
}

export async function POST(req: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Apply rate limiting
    const rateLimitResponse = await subscriptionRateLimiter(req);
    if (rateLimitResponse) return rateLimitResponse;
    
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

    const { priceId, workspaceId, workspaceSlug } = await req.json();

    if (!priceId || (!workspaceId && !workspaceSlug)) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Price ID and either Workspace ID or Slug are required' },
        { status: 400 }
      );
    }

    // Find workspace by ID or slug
    const workspace = await prisma_client.workspace.findFirst({
      where: workspaceId ? { id: workspaceId } : { slug: workspaceSlug },
      include: { user_workspaces: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found', details: `No workspace found with ${workspaceId ? 'ID ' + workspaceId : 'slug ' + workspaceSlug}` },
        { status: 404 }
      );
    }

    // Calculate number of seats based on workspace members
    const quantity = workspace.user_workspaces.length || 1; // Ensure at least 1 seat

    let customerId = workspace.stripe_customer_id;

    if (!customerId) {
      try {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: session.user.email!,
          metadata: {
            workspaceId: workspace.id.toString(),
          },
        });
        customerId = customer.id;

        // Update workspace with Stripe customer ID
        await prisma_client.workspace.update({
          where: { id: workspace.id },
          data: { stripe_customer_id: customerId },
        });
      } catch (stripeError: any) {
        console.error('Stripe customer creation error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer', details: stripeError.message },
          { status: 500 }
        );
      }
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
      }

      // Use dedicated checkout routes instead of workspace slug
      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&workspace=${workspace.id}`;
      const cancelUrl = `${baseUrl}/checkout/cancel?workspace=${workspace.id}`;

      const checkoutSession = await createStripeCheckoutSession({
        priceId,
        customerId,
        quantity,
        successUrl,
        cancelUrl,
        metadata: {
          workspaceId: workspace.id.toString(),
          planType: 'EARLY_ADOPTER',
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error('Stripe checkout session creation error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to create checkout session', details: stripeError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Error creating subscription', details: error.message },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function GET(req: Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Get the user session using Supabase
    const cookieStore = cookies();
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (!session || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const workspace = await prisma_client.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: {
        subscription: true,
        user_workspaces: {
          select: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // If there's no active subscription, return free plan
    if (!workspace.subscription || !['ACTIVE', 'TRIALING'].includes(workspace.subscription.status)) {
      return NextResponse.json({
        plan_type: 'FREE',
        status: null,
        current_period_end: null,
        price_id: null,
        users: workspace.user_workspaces.map(uw => ({
          id: uw.user.id,
          email: uw.user.email
        }))
      });
    }

    // For active subscriptions, fetch additional details from Stripe
    try {
      // Get the subscription details from Stripe to get the price ID
      const stripeSubscription = await stripe.subscriptions.retrieve(
        workspace.subscription.stripe_subscription_id
      );
      
      // Get the current price ID from the subscription
      const priceId = stripeSubscription.items.data[0]?.price.id || null;
      
      // Get the next payment amount from the upcoming invoice
      let nextPaymentAmount = null;
      try {
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: workspace.subscription.stripe_subscription_id,
        });
        nextPaymentAmount = upcomingInvoice.total;
      } catch (invoiceError) {
        console.error('Failed to fetch upcoming invoice:', invoiceError);
      }
      
      return NextResponse.json({
        plan_type: workspace.subscription.plan_type,
        status: workspace.subscription.status,
        current_period_end: workspace.subscription.current_period_end,
        price_id: priceId,
        next_payment_amount: nextPaymentAmount,
        users: workspace.user_workspaces.map(uw => ({
          id: uw.user.id,
          email: uw.user.email
        }))
      });
    } catch (stripeError) {
      console.error('Failed to fetch Stripe subscription details:', stripeError);
      
      // Return basic info without price ID if Stripe fetch fails
      return NextResponse.json({
        plan_type: workspace.subscription.plan_type,
        status: workspace.subscription.status,
        current_period_end: workspace.subscription.current_period_end,
        price_id: null,
        users: workspace.user_workspaces.map(uw => ({
          id: uw.user.id,
          email: uw.user.email
        }))
      });
    }

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription status' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 