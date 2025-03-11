import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { stripe, mapStripeStatusToDbStatus } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

// Mark as dynamic to ensure it's not cached
export const dynamic = 'force-dynamic';

// Utility function to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// New function to retry getting subscription
async function getSubscriptionWithRetry(workspaceId: number, maxRetries = 3, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { 
        id: true,
        subscription_id: true,
        stripe_customer_id: true,
        subscription: {
          select: {
            id: true,
            status: true,
            stripe_subscription_id: true,
            canceled_at: true
          }
        }
      },
    });

    if (workspace?.subscription && workspace.subscription.status === 'ACTIVE') {
      return workspace;
    }

    console.log(`Retry ${i + 1}/${maxRetries}: Waiting for subscription to be active...`);
    await sleep(delayMs);
  }
  return null;
}

// Safe server-side tracking function that doesn't use client-side PostHog
async function trackCheckoutServerSide(workspaceId: number, sessionId: string, status: string) {
  try {
    // Only attempt if we have a POSTHOG_KEY
    const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (!posthogApiKey || !posthogHost) return;
    
    // Import PostHog Node library dynamically to avoid client-side loading
    const { PostHog } = await import('posthog-node');
    
    // Initialize server-side PostHog client
    const posthog = new PostHog(posthogApiKey, {
      host: posthogHost,
    });
    
    // Get workspace info for better tracking data
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { 
        id: true,
        name: true,
        created_at: true,
      }
    });
    
    if (workspace) {
      // Capture the checkout event server-side
      await posthog.capture({
        distinctId: `workspace-${workspaceId}`,
        event: 'checkout_completed',
        properties: {
          workspace_id: workspaceId,
          session_id: sessionId,
          status: status,
          workspace_name: workspace.name,
          created_at: workspace.created_at,
        }
      });
      
      console.log('Successfully tracked checkout event server-side');
    }
  } catch (error) {
    // Just log the error - don't let tracking issues affect the main flow
    console.error('Error tracking checkout event:', error);
  }
}

interface SearchParams {
  session_id?: string;
  workspace?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CheckoutSuccessPage(props: PageProps) {
  // Get search params values and ensure they are strings
  // In Next.js 15, we need to await searchParams
  const searchParams = await props.searchParams;
  const sessionId = String(searchParams?.session_id || '');
  const workspaceId = String(searchParams?.workspace || '');

  console.log('Processing checkout success', { 
    hasSessionId: !!sessionId,
    workspaceId 
  });

  // Validate required parameters
  if (!sessionId || !workspaceId) {
    console.error('Missing required parameters');
    return redirect('/dashboard');
  }
  
  // Validate workspace ID is a number
  const workspaceIdNumber = parseInt(workspaceId);
  if (isNaN(workspaceIdNumber)) {
    console.error('Invalid workspace ID format:', workspaceId);
    return redirect('/dashboard');
  }

  let session;
  try {
    // Verify the checkout session
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    // Sanitize error logging
    const sanitizedError = {
      type: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? 
        error.message.replace(/[a-zA-Z0-9]{24,}/g, '[REDACTED]') : 
        'Unknown error'
    };
    console.error('Error retrieving checkout session:', sanitizedError);
    
    return redirect(`/dashboard?workspace=${workspaceId}&checkout=failed&error=invalid_session`);
  }
    
  if (session.payment_status !== 'paid') {
    console.error('Payment not completed');
    return redirect(`/dashboard?workspace=${workspaceId}&checkout=failed`);
  }

  // Wait for a short period to allow webhook processing
  await sleep(2000);

  try {
    // First, try to find an existing active subscription
    const existingWorkspace = await getSubscriptionWithRetry(workspaceIdNumber);
    
    if (existingWorkspace?.subscription?.status === 'ACTIVE') {
      console.log('Found active subscription:', existingWorkspace.subscription.id);
      return redirect(`/dashboard?workspace=${workspaceId}&checkout=success`);
    }

    // If no active subscription found, proceed with creating/updating one
    let workspace = await prisma.workspace.findUnique({
      where: { id: workspaceIdNumber },
      select: { 
        id: true,
        subscription_id: true,
        stripe_customer_id: true,
        subscription: {
          select: {
            id: true,
            status: true,
            stripe_subscription_id: true,
            canceled_at: true
          }
        }
      },
    });

    if (!workspace) {
      console.error('Workspace not found');
      return redirect(`/dashboard?workspace=${workspaceId}&checkout=failed&error=workspace_not_found`);
    }

    // CRITICAL: If subscription doesn't exist or is canceled, create a new one
    if (!workspace.subscription || workspace.subscription.status === 'CANCELED') {
      console.log(workspace.subscription 
        ? 'Previous subscription was canceled, creating new one' 
        : 'Subscription not found via webhook, creating manually');
      
      // Fetch subscription directly from Stripe using the session
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      if (!stripeSubscription) {
        console.error('Stripe subscription not found');
        return redirect(`/dashboard?workspace=${workspaceId}&checkout=failed&error=stripe_subscription_not_found`);
      }
      
      // Map Stripe subscription status to our enum using the utility function
      const mappedStatus = mapStripeStatusToDbStatus(stripeSubscription.status);
      console.log(`Mapping Stripe status '${stripeSubscription.status}' to '${mappedStatus}'`);
      
      // If there was a previous subscription, update it
      if (workspace.subscription && workspace.subscription.status === 'CANCELED') {
        await prisma.subscription.update({
          where: { id: workspace.subscription.id },
          data: {
            stripe_subscription_id: stripeSubscription.id,
            plan_type: 'EARLY_ADOPTER', 
            quantity_seats: stripeSubscription.items.data[0].quantity || 1,
            current_period_start: new Date(stripeSubscription.current_period_start * 1000),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000),
            trial_end_date: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
            status: mappedStatus,
            canceled_at: null, // Clear the canceled date
          },
        });
        
        // Get customer details from Stripe
        const customer = await stripe.customers.retrieve(session.customer as string, {
          expand: ['tax_ids']
        }) as Stripe.Customer;
        
        // Create or update billing information
        const defaultTaxRate = 20.00; // Default tax rate
        await prisma.workspace_billing_infos.upsert({
          where: {
            workspace_id: workspaceIdNumber,
          },
          update: {
            billing_email: customer.email || '',
            billing_address: [
              customer.address?.line1,
              customer.address?.line2,
              customer.address?.city,
              customer.address?.state,
              customer.address?.postal_code,
              customer.address?.country,
            ].filter(Boolean).join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
          create: {
            workspace_id: workspaceIdNumber,
            billing_email: customer.email || '',
            billing_address: [
              customer.address?.line1,
              customer.address?.line2,
              customer.address?.city,
              customer.address?.state,
              customer.address?.postal_code,
              customer.address?.country,
            ].filter(Boolean).join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
        });
        
        // Update the workspace with the new subscription ID
        await prisma.workspace.update({
          where: { id: workspaceIdNumber },
          data: { subscription_id: workspace.subscription.id },
        });
        
        console.log('Updated previous subscription record and billing information');
      } else {
        // Create a new subscription in the database
        const newSubscription = await prisma.subscription.create({
          data: {
            workspace_id: workspaceIdNumber,
            stripe_subscription_id: stripeSubscription.id,
            plan_type: 'EARLY_ADOPTER', 
            quantity_seats: stripeSubscription.items.data[0].quantity || 1,
            current_period_start: new Date(stripeSubscription.current_period_start * 1000),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000),
            trial_end_date: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
            status: mappedStatus,
          },
        });
        
        // Get customer details from Stripe
        const customer = await stripe.customers.retrieve(session.customer as string, {
          expand: ['tax_ids']
        }) as Stripe.Customer;
        
        // Create or update billing information
        const defaultTaxRate = 20.00; // Default tax rate
        await prisma.workspace_billing_infos.upsert({
          where: {
            workspace_id: workspaceIdNumber,
          },
          update: {
            billing_email: customer.email || '',
            billing_address: [
              customer.address?.line1,
              customer.address?.line2,
              customer.address?.city,
              customer.address?.state,
              customer.address?.postal_code,
              customer.address?.country,
            ].filter(Boolean).join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
          create: {
            workspace_id: workspaceIdNumber,
            billing_email: customer.email || '',
            billing_address: [
              customer.address?.line1,
              customer.address?.line2,
              customer.address?.city,
              customer.address?.state,
              customer.address?.postal_code,
              customer.address?.country,
            ].filter(Boolean).join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
        });
        
        // Update the workspace with the new subscription ID
        await prisma.workspace.update({
          where: { id: workspaceIdNumber },
          data: { subscription_id: newSubscription.id },
        });
        
        console.log('Created new subscription record and billing information');
      }
    } else {
      console.log('Subscription already exists:', workspace.subscription.id);
    }

    // Single exit point for success
    console.log('Subscription process completed successfully');
    
    // Track the successful checkout server-side (won't cause client errors)
    await trackCheckoutServerSide(workspaceIdNumber, sessionId, 'success');
    
    // Check if this was an upgrade (previously canceled subscription)
    const wasUpgrade = workspace.subscription && workspace.subscription.status === 'CANCELED';
    const actionParam = wasUpgrade ? '&action=upgrade' : '';
    
    return redirect(`/dashboard?workspace=${workspaceId}&checkout=success${actionParam}`);

  } catch (error) {
    // Only handle actual errors, not redirects
    if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
      // Sanitize error logging
      const sanitizedError = {
        type: error.name,
        message: error.message.replace(/[a-zA-Z0-9]{24,}/g, '[REDACTED]')
      };
      console.error('Error in checkout flow:', sanitizedError);
      
      const encodedError = encodeURIComponent('An error occurred during checkout');
      
      // Track the failed checkout server-side
      await trackCheckoutServerSide(workspaceIdNumber, '[REDACTED]', 'failed');
      
      return redirect(`/dashboard?workspace=${workspaceId}&checkout=failed&error=${encodedError}`);
    }
    throw error;
  }
} 