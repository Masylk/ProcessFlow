import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { stripe, mapStripeStatusToDbStatus } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

// Mark as dynamic to ensure it's not cached
export const dynamic = 'force-dynamic';

// Utility function to wait for a specified time
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// New function to retry getting subscription
async function getSubscriptionWithRetry(
  workspaceId: number,
  maxRetries = 3,
  delayMs = 2000
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  for (let i = 0; i < maxRetries; i++) {
    const workspace = await prisma_client.workspace.findUnique({
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
            canceled_at: true,
          },
        },
      },
    });
    if (isVercel()) await prisma_client.$disconnect();
    if (workspace?.subscription && workspace.subscription.status === 'ACTIVE') {
      return workspace;
    }

    await sleep(delayMs);
  }
  return null;
}

// Safe server-side tracking function that doesn't use client-side PostHog
async function trackCheckoutServerSide(
  workspaceId: number,
  sessionId: string,
  status: string
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
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
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        created_at: true,
      },
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
        },
      });
    }
  } catch (error) {
    if (isVercel()) await prisma_client.$disconnect();
    // Just log the error - don't let tracking issues affect the main flow
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

interface SearchParams {
  session_id?: string;
  workspace?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

async function handleSubscriptionActivated(
  sessionId: string,
  workspaceId: string
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    // Get the session details from Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.subscription) {
      // Get the subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (subscription.status === 'active') {
        // Find the user who made the purchase
        const user = await prisma_client.user.findFirst({
          where: {
            workspaces: {
              some: {
                workspace_id: parseInt(workspaceId),
              },
            },
          },
        });

        if (isVercel()) await prisma_client.$disconnect();

        if (user) {
          // Send the subscription activated email
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/email/subscription-activated`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                workspaceId: parseInt(workspaceId),
              }),
            }
          );

          if (!response.ok) {
            console.error(
              'Failed to send subscription activated email:',
              await response.text()
            );
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.log('Successfully sent subscription activated email');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling subscription activation:', error);
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

export default async function CheckoutSuccessPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const sessionId = String(searchParams?.session_id || '');
  const workspaceId = String(searchParams?.workspace || '');

  if (!sessionId || !workspaceId) {
    return redirect('/');
  }

  const workspaceIdNumber = parseInt(workspaceId);
  if (isNaN(workspaceIdNumber)) {
    return redirect('/');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    return redirect(
      `/?workspace=${workspaceId}&checkout=failed&error=invalid_session`
    );
  }

  if (session.payment_status !== 'paid') {
    return redirect(`/?workspace=${workspaceId}&checkout=failed`);
  }

  await sleep(2000);

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    return redirect('/');
  }

  try {
    const existingWorkspace = await getSubscriptionWithRetry(workspaceIdNumber);

    if (existingWorkspace?.subscription?.status === 'ACTIVE') {
      return redirect(`/?workspace=${workspaceId}&checkout=success`);
    }

    let workspace = await prisma_client.workspace.findUnique({
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
            canceled_at: true,
          },
        },
      },
    });

    if (isVercel()) await prisma_client.$disconnect();

    if (!workspace) {
      return redirect(
        `/?workspace=${workspaceId}&checkout=failed&error=workspace_not_found`
      );
    }

    if (
      !workspace.subscription ||
      workspace.subscription.status === 'CANCELED'
    ) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!stripeSubscription) {
        return redirect(
          `/?workspace=${workspaceId}&checkout=failed&error=stripe_subscription_not_found`
        );
      }

      const mappedStatus = mapStripeStatusToDbStatus(stripeSubscription.status);

      if (
        workspace.subscription &&
        workspace.subscription.status === 'CANCELED'
      ) {
        await prisma_client.subscription.update({
          where: { id: workspace.subscription.id },
          data: {
            stripe_subscription_id: stripeSubscription.id,
            plan_type: 'EARLY_ADOPTER',
            quantity_seats: stripeSubscription.items.data[0].quantity || 1,
            current_period_start: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            current_period_end: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            trial_end_date: stripeSubscription.trial_end
              ? new Date(stripeSubscription.trial_end * 1000)
              : null,
            status: mappedStatus,
            canceled_at: null,
          },
        });

        const customer = (await stripe.customers.retrieve(
          session.customer as string,
          {
            expand: ['tax_ids'],
          }
        )) as Stripe.Customer;

        const defaultTaxRate = 20.0;
        await prisma_client.workspace_billing_infos.upsert({
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
            ]
              .filter(Boolean)
              .join('\n'),
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
            ]
              .filter(Boolean)
              .join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
        });

        await prisma_client.workspace.update({
          where: { id: workspaceIdNumber },
          data: { subscription_id: workspace.subscription.id },
        });
      } else {
        const newSubscription = await prisma_client.subscription.create({
          data: {
            workspace_id: workspaceIdNumber,
            stripe_subscription_id: stripeSubscription.id,
            plan_type: 'EARLY_ADOPTER',
            quantity_seats: stripeSubscription.items.data[0].quantity || 1,
            current_period_start: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            current_period_end: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            trial_end_date: stripeSubscription.trial_end
              ? new Date(stripeSubscription.trial_end * 1000)
              : null,
            status: mappedStatus,
          },
        });

        const customer = (await stripe.customers.retrieve(
          session.customer as string,
          {
            expand: ['tax_ids'],
          }
        )) as Stripe.Customer;

        const defaultTaxRate = 20.0;
        await prisma_client.workspace_billing_infos.upsert({
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
            ]
              .filter(Boolean)
              .join('\n'),
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
            ]
              .filter(Boolean)
              .join('\n'),
            tax_rate: defaultTaxRate,
            vat_number: customer.tax_ids?.data[0]?.value || null,
          },
        });

        await prisma_client.workspace.update({
          where: { id: workspaceIdNumber },
          data: { subscription_id: newSubscription.id },
        });
      }
      if (isVercel()) await prisma_client.$disconnect();
    } else {
      if (isVercel()) await prisma_client.$disconnect();
    }

    await trackCheckoutServerSide(workspaceIdNumber, '[REDACTED]', 'success');

    const wasUpgrade =
      workspace.subscription && workspace.subscription.status === 'CANCELED';
    const actionParam = wasUpgrade ? '&action=upgrade' : '';

    await handleSubscriptionActivated(sessionId, workspaceId);

    return redirect(
      `/?workspace=${workspaceId}&checkout=success${actionParam}`
    );
  } catch (error) {
    if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
      await trackCheckoutServerSide(workspaceIdNumber, '[REDACTED]', 'failed');
      if (isVercel()) await prisma_client.$disconnect();
      return redirect(
        `/?workspace=${workspaceId}&checkout=failed&error=checkout_error`
      );
    }
    if (isVercel()) await prisma_client.$disconnect();
    throw error;
  }
}
