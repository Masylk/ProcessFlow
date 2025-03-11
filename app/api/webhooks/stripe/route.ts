import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, mapStripeStatusToDbStatus } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { webhookRateLimiter } from '@/lib/rateLimit';

// Validate webhook secret is configured
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

// Add type for customer metadata
interface CustomerMetadata {
  workspaceId: string;
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Handling subscription created webhook:', {
    subscription_id: subscription.id,
    customer: subscription.customer,
  });

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

    console.log('Successfully processed subscription creation:', {
      subscription_id: subscription.id,
      result_id: result.id,
    });

    return result;
  } catch (error) {
    console.error('Error processing subscription creation:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Map Stripe subscription status to our enum using the utility function
  const mappedStatus = mapStripeStatusToDbStatus(subscription.status);
  console.log(`Updating subscription: Mapping Stripe status '${subscription.status}' to '${mappedStatus}'`);
  
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
  // Implement grace period logic here
  // For now, we'll just log the failure
  console.error(`Payment failed for invoice ${invoice.id}`);
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Handling customer updated webhook:', {
    customer_id: customer.id,
    email: customer.email,
  });

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
    await prisma.workspace_billing_infos.upsert({
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

    console.log('Successfully updated billing information for workspace:', workspace.id, {
      email: customerDetails.email,
      address: formattedAddress,
      vat_number: customerDetails.tax_ids?.data[0]?.value
    });
  } catch (error) {
    console.error('Error updating billing information:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Apply rate limiting (with higher limits for webhooks)
    const rateLimitResponse = await webhookRateLimiter(req);
    if (rateLimitResponse) {
      console.warn('Webhook rate limit exceeded');
      return rateLimitResponse;
    }
    
    // Validate webhook secret is configured in this request context
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found in webhook request');
      throw new Error('No stripe signature found');
    }

    // Remove potentially sensitive logging
    console.log('Received webhook request');
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Log only non-sensitive event information
    console.log('Processing webhook event type:', event.type);

    // For subscription events, log only essential non-sensitive details
    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Processing subscription webhook:', {
        type: event.type,
        hasWorkspaceId: !!subscription.metadata.workspaceId
      });
      
      if (!subscription.metadata.workspaceId) {
        console.error('Missing workspaceId in subscription metadata');
      }
    }

    let result;
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          result = await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          console.log('Successfully created subscription in database:', result?.id);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          console.log('Successfully updated subscription in database');
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          console.log('Successfully marked subscription as canceled in database');
          break;
        case 'customer.updated':
          await handleCustomerUpdated(event.data.object as Stripe.Customer);
          console.log('Successfully updated customer billing information');
          break;
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          console.log('Successfully processed paid invoice');
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          console.log('Successfully processed failed invoice payment');
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (processingError) {
      // Sanitize error logging
      const sanitizedError = {
        type: processingError instanceof Error ? processingError.name : 'Unknown',
        message: processingError instanceof Error ? 
          processingError.message.replace(/[a-zA-Z0-9]{24,}/g, '[REDACTED]') : 
          'Unknown error'
      };
      console.error(`Error processing webhook:`, sanitizedError);
      
      return NextResponse.json({ 
        received: true, 
        success: false, 
        error: 'Error processing webhook event'
      });
    }

    console.log('Successfully processed webhook event:', event.type);
    return NextResponse.json({ received: true, success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Return a 200 response even on error to prevent Stripe from retrying
    // This is important because the checkout success page will handle creation if the webhook fails
    return NextResponse.json(
      { 
        received: true, 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 200 }
    );
  }
} 