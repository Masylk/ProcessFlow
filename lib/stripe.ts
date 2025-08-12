import Stripe from 'stripe';
import './env-check';  // This will run the environment checks on import

// Create a function to retrieve and validate the Stripe API key
function getStripeKey() {
  // Try multiple potential environment variable names
  const key = process.env.STRIPE_SECRET_KEY || 
              process.env.STRIPE_API_KEY || 
              process.env.STRIPE_KEY;
  
  if (!key) {
    console.error('⚠️ Stripe Secret Key is missing!');
    console.error('Please ensure one of these environment variables is set:');
    console.error('- STRIPE_SECRET_KEY (recommended)');
    console.error('- STRIPE_API_KEY');
    console.error('- STRIPE_KEY');
    console.error('Check your .env file and make sure Next.js is loading it correctly.');
    
    // Only log environment details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.log('Current environment:', process.env.NODE_ENV);
      console.log('Available environment variables:', 
        Object.keys(process.env)
          .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
          .join(', ')
      );
    }
    
    // In development, return a placeholder that will fail gracefully
    if (process.env.NODE_ENV === 'development') {
      return 'sk_test_placeholder_for_development_only';
    }
    return '';
  }
  
  return key;
}

// Get the Stripe key
const stripeKey = getStripeKey();

// Create a Stripe instance with proper error handling
export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'ProcessFlow',
    version: '1.0.0',
  },
});

// Define price IDs with fallbacks to avoid undefined errors
export const STRIPE_PRICE_IDS = {
  EARLY_ADOPTER: {
    MONTHLY: process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID || '',
    ANNUAL: process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID || '',
  },
} as const;

export const CURRENCY_MULTIPLIER = 100; // Stripe amounts are in cents

// Constants for pricing with safeguards against undefined
export const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID || '';
export const PRICE_ID_ANNUAL = process.env.STRIPE_PRICE_ID_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID || '';

export async function createStripeCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  quantity = 1,
  metadata = {},
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
  metadata?: Record<string, string>;
}) {
  // Ensure workspaceId is included in metadata for webhook processing
  if (!metadata.workspaceId) {
    console.warn('No workspaceId in metadata for checkout session');
  }
  
  // Add additional fields to help with debugging
  const enrichedMetadata = {
    ...metadata,
    created_at: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
  
  // Only log metadata in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.log('Creating checkout session with metadata:', enrichedMetadata);
  }
  
  try {
    return await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      metadata: enrichedMetadata,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      currency: 'eur', // Changed from USD to EUR to match the price configuration
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}

export async function createStripePortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  } catch (error: any) {
    // If no configuration exists, create a default one
    if (error.code === 'billing_portal_configuration_not_found' || 
        error.message?.includes('No configuration provided')) {
      console.log('Creating default customer portal configuration...');
      
      try {
        // Create a default configuration
        await stripe.billingPortal.configurations.create({
          business_profile: {
            headline: 'ProcessFlow - Manage your subscription',
          },
          features: {
            payment_method_update: {
              enabled: true,
            },
            invoice_history: {
              enabled: true,
            },
            customer_update: {
              enabled: true,
              allowed_updates: ['address', 'email', 'tax_id'],
            },
            subscription_cancel: {
              enabled: true,
              mode: 'at_period_end',
            },
            subscription_update: {
              enabled: true,
              default_allowed_updates: ['price', 'quantity'],
              proration_behavior: 'create_prorations',
            },
          },
        });
        
        console.log('Default customer portal configuration created successfully');
        
        // Now try creating the session again
        return await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
      } catch (configError) {
        console.error('Error creating customer portal configuration:', configError);
        throw configError;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function getStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function updateStripeSubscriptionQuantity(
  subscriptionId: string,
  quantity: number
) {
  return stripe.subscriptions.update(subscriptionId, {
    items: [{ quantity }],
  });
}

export async function updateStripeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    // Get the subscription to find the current items
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the current subscription item ID
    const currentItemId = subscription.items.data[0].id;
    
    // Update the subscription with the new price
    return stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: newPriceId,
          // Keep the same quantity
          quantity: subscription.items.data[0].quantity || 1,
        },
      ],
      // Don't prorate immediately, but on next billing cycle
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
}

// Map Stripe subscription status to our enum
export function mapStripeStatusToDbStatus(stripeStatus: string): 'ACTIVE' | 'TRIALING' | 'CANCELED' {
  const statusMap: Record<string, 'ACTIVE' | 'TRIALING' | 'CANCELED'> = {
    'active': 'ACTIVE',
    'trialing': 'TRIALING',
    'canceled': 'CANCELED',
    'unpaid': 'CANCELED',
    'past_due': 'ACTIVE', // You might want a different mapping for past_due
    'incomplete': 'ACTIVE', // You might want a different mapping for incomplete
    'incomplete_expired': 'CANCELED',
  };
  
  // Log when encountering an unknown status
  if (!statusMap[stripeStatus]) {
    console.warn(`Unknown Stripe status: ${stripeStatus}, defaulting to ACTIVE`);
  }
  
  return statusMap[stripeStatus] || 'ACTIVE';
} 