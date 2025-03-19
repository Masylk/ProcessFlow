import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, mapStripeStatusToDbStatus } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { webhookRateLimiter } from '@/lib/rateLimit';

// Validate webhook secret is configured
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

// Add type for customer metadata
interface CustomerMetadata {
  workspaceId: string;
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {

  try {
    // Get the customer to find the workspace
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const workspaceId = (customer.metadata as unknown as CustomerMetadata).workspaceId;

    if (!workspaceId) {
      throw new Error('No workspace ID found in customer metadata');
    }

    // Get customer's billing details from Stripe
    const customerDetails = await stripe.customers.retrieve(subscription.customer as string, {
      expand: ['tax_ids']
    }) as Stripe.Customer;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create subscription record
      const sub = await tx.subscription.create({
        data: {
          workspace_id: parseInt(workspaceId),
          stripe_subscription_id: subscription.id,
          plan_type: 'EARLY_ADOPTER',
          quantity_seats: 1,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          trial_end_date: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
        },
      });

      // Create or update billing information
      const defaultTaxRate = 20.00; // Default tax rate, adjust as needed
      await tx.workspace_billing_infos.upsert({
        where: {
          workspace_id: parseInt(workspaceId),
        },
        update: {
          billing_email: customerDetails.email || '',
          billing_address: [
            customerDetails.address?.line1,
            customerDetails.address?.line2,
            customerDetails.address?.city,
            customerDetails.address?.state,
            customerDetails.address?.postal_code,
            customerDetails.address?.country,
          ].filter(Boolean).join('\n'),
          tax_rate: defaultTaxRate,
          vat_number: customerDetails.tax_ids?.data[0]?.value || null,
        },
        create: {
          workspace_id: parseInt(workspaceId),
          billing_email: customerDetails.email || '',
          billing_address: [
            customerDetails.address?.line1,
            customerDetails.address?.line2,
            customerDetails.address?.city,
            customerDetails.address?.state,
            customerDetails.address?.postal_code,
            customerDetails.address?.country,
          ].filter(Boolean).join('\n'),
          tax_rate: defaultTaxRate,
          vat_number: customerDetails.tax_ids?.data[0]?.value || null,
        },
      });

      // Update workspace subscription ID
      await tx.workspace.update({
        where: { id: parseInt(workspaceId) },
        data: { subscription_id: sub.id },
      });

      return sub;
    });

    return result;
  } catch (error) {
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Map Stripe subscription status to our enum using the utility function
  const mappedStatus = mapStripeStatusToDbStatus(subscription.status);
  
  await prisma.subscription.update({
    where: {
      stripe_subscription_id: subscription.id,
    },
    data: {
      quantity_seats: subscription.items.data[0].quantity || 1,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      status: mappedStatus,
      canceled_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: {
      stripe_subscription_id: subscription.id,
    },
    data: {
      status: 'CANCELED',
      canceled_at: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await prisma.subscription.findUnique({
    where: {
      stripe_subscription_id: invoice.subscription as string,
    },
  });

  if (!subscription) return;

  await prisma.billing.create({
    data: {
      subscription_id: subscription.id,
      workspace_id: subscription.workspace_id,
      stripe_invoice_id: invoice.id,
      amount_net: invoice.amount_due,
      tax_amount: invoice.tax || 0,
      amount_gross: invoice.total,
      currency: invoice.currency,
      invoice_date: new Date(invoice.created * 1000),
      due_date: new Date(invoice.due_date! * 1000),
      paid_at: invoice.paid ? new Date() : null,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Remove console.error - implement actual error handling if needed
  // For now just return silently
  return;
}

async function handleCustomerUpdated(customer: Stripe.Customer) {

  try {
    // Get the full customer details with expanded tax_ids
    const customerDetails = await stripe.customers.retrieve(customer.id, {
      expand: ['tax_ids']
    }) as Stripe.Customer;

    // Find the workspace associated with this customer
    const workspace = await prisma.workspace.findFirst({
      where: { stripe_customer_id: customer.id },
    });

    if (!workspace) {
      console.error('No workspace found for Stripe customer:', customer.id);
      return;
    }

    // Format the billing address
    const address: Stripe.Address = customerDetails.address || {
      line1: '',
      line2: null,
      city: '',
      state: '',
      postal_code: '',
      country: ''
    };

    const formattedAddress = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ].filter(Boolean).join('\n');

    // Update billing information
    return await prisma.workspace_billing_infos.upsert({
      where: {
        workspace_id: workspace.id,
      },
      update: {
        billing_email: customerDetails.email || '',
        billing_address: formattedAddress,
        vat_number: customerDetails.tax_ids?.data[0]?.value || null,
      },
      create: {
        workspace_id: workspace.id,
        billing_email: customerDetails.email || '',
        billing_address: formattedAddress,
        tax_rate: 20.00, // Default tax rate
        vat_number: customerDetails.tax_ids?.data[0]?.value || null,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const rateLimitResponse = await webhookRateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      throw new Error('No stripe signature found');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'customer.updated':
          await handleCustomerUpdated(event.data.object as Stripe.Customer);
          break;
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }

      // Handle the event
      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Check if this is an Early Adopter plan
        const earlyAdopterMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID;
        const earlyAdopterAnnualPriceId = process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID;
        
        const isEarlyAdopterPlan = subscription.items.data.some(item => 
          item.price.id === earlyAdopterMonthlyPriceId || 
          item.price.id === earlyAdopterAnnualPriceId
        );
        
        if (isEarlyAdopterPlan && subscription.status === 'active') {
          // Find the workspace with this subscription
          const workspace = await prisma.workspace.findFirst({
            where: { stripe_customer_id: subscription.customer as string },
          });
          
          if (workspace) {
            // Find the active users for this workspace
            const activeUsers = await prisma.user.findMany({
              where: { active_workspace_id: workspace.id },
            });
            
            if (activeUsers.length > 0) {
              // Send the subscription activated email to each active user
              for (const user of activeUsers) {
                console.log(`Sending subscription activated email to user ${user.id} (${user.email})`);
                
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/subscription-activated`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      workspaceId: workspace.id,
                    }),
                  });
                  
                  if (!response.ok) {
                    console.error(`Failed to send subscription activated email to ${user.email}:`, await response.text());
                  } else {
                    console.log(`Successfully sent subscription activated email to ${user.email}`);
                  }
                } catch (error) {
                  console.error(`Error sending subscription activated email to ${user.email}:`, error);
                }
              }
            } else {
              console.log(`No active users found for workspace ${workspace.id}`);
            }
          } else {
            console.log(`No workspace found for Stripe customer ${subscription.customer}`);
          }
        }
      }
    } catch (processingError) {
      return NextResponse.json({ 
        received: true, 
        success: false, 
        error: 'Error processing webhook event'
      });
    }

    return NextResponse.json({ received: true, success: true });
  } catch (error) {
    return NextResponse.json(
      { 
        received: true, 
        success: false,
        error: 'Webhook processing error'
      },
      { status: 200 }
    );
  }
} 