import { NextResponse } from 'next/server';
import { stripe, updateStripeSubscriptionPlan, STRIPE_PRICE_IDS } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { subscriptionRateLimiter } from '@/lib/rateLimit';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

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

    // Parse the request body
    const { workspaceId, billingPeriod } = await req.json();

    if (!workspaceId || !billingPeriod || !['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields', details: 'Workspace ID and valid billing period (monthly/annual) are required' },
        { status: 400 }
      );
    }

    // Find workspace and subscription
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: { subscription: true }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (!workspace.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID based on selected billing period
    const newPriceId = billingPeriod === 'monthly' 
      ? STRIPE_PRICE_IDS.EARLY_ADOPTER.MONTHLY 
      : STRIPE_PRICE_IDS.EARLY_ADOPTER.ANNUAL;

    try {
      if (process.env.NODE_ENV !== 'production') {
        // Log the subscription details before update
        console.log('Attempting to update subscription:', {
          workspaceId,
          subscriptionId: workspace.subscription.stripe_subscription_id,
          currentPriceId: await stripe.subscriptions.retrieve(workspace.subscription.stripe_subscription_id)
            .then(sub => sub.items.data[0]?.price.id)
            .catch(e => {
              console.error('Error retrieving current subscription:', e);
              return null;
            }),
          newPriceId,
          environment: process.env.NODE_ENV,
          stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'
        });
      }

      // Update the subscription in Stripe
      const updatedSubscription = await updateStripeSubscriptionPlan(
        workspace.subscription.stripe_subscription_id,
        newPriceId
      );

      // Get the current subscription details for comparison
      const oldPriceId = await stripe.subscriptions.retrieve(workspace.subscription.stripe_subscription_id)
        .then(sub => sub.items.data[0]?.price.id)
        .catch(() => null);

      // Determine if this was an upgrade (monthly to annual) or downgrade (annual to monthly)
      const isUpgrade = billingPeriod === 'annual';
      const changePeriod = isUpgrade ? 'annual' : 'monthly';
      const changeType = isUpgrade ? 'upgraded' : 'switched';

      // Update the subscription record in our database
      await prisma_client.subscription.update({
        where: { id: workspace.subscription.id },
        data: {
          // Update the current period end based on Stripe's response
          current_period_end: new Date(updatedSubscription.current_period_end * 1000),
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully ${changeType} to ${changePeriod} billing`,
        details: `Your subscription has been ${changeType} to ${changePeriod} billing.`,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000),
        billing_period: billingPeriod,
        is_upgrade: isUpgrade
      });
    } catch (stripeError: any) {
      console.error('Stripe subscription update error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to update subscription', details: stripeError.message },
        { status: 500 }
      );
    } finally {
      if (isVercel()) {
        await prisma_client.$disconnect();
      }
    }
  } catch (error: any) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: 'Error updating subscription', details: error.message },
      { status: 500 }
    );
  }
} 