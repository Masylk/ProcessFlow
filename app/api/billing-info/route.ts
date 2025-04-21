import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabaseServerClient';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

// Helper function to determine if we should log
const shouldLog = () => {
  const env = process.env.NODE_ENV;
  return env !== 'production';
};

// Helper function for conditional logging
const conditionalLog = (...args: any[]) => {
  if (shouldLog()) {
    console.log(...args);
  }
};

// Helper function for conditional error logging
const conditionalErrorLog = (...args: any[]) => {
  if (shouldLog()) {
    console.error(...args);
  }
};

interface BillingInfoRequest {
  workspaceId: number;
  billing_email: string;
  billing_address: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country_code: string;
  tax_rate: number;
  vat_number?: string;
}

// GET billing info for a workspace
export async function GET(req: Request) {
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

    // Find workspace and check if user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      include: {
        user_workspaces: {
          where: {
            user: {
              auth_id: session.user.id
            }
          }
        },
        billing_infos: true
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.user_workspaces.length === 0) {
      return NextResponse.json({ error: 'Unauthorized access to workspace' }, { status: 403 });
    }

    // If there's no Stripe customer ID, return empty billing info
    if (!workspace.stripe_customer_id) {
      return NextResponse.json({
        billing_email: '',
        billing_address: '',
        address_line1: '',
        city: '',
        postal_code: '',
        country_code: '',
        tax_rate: 0,
      });
    }

    try {
      // Get the latest customer details from Stripe
      const customer = await stripe.customers.retrieve(workspace.stripe_customer_id, {
        expand: ['tax_ids']
      }) as Stripe.Customer;

      if ('deleted' in customer) {
        throw new Error('Stripe customer has been deleted');
      }

      // Format the address components
      const address: Stripe.Address = customer.address || {
        line1: '',
        line2: null,
        city: '',
        state: '',
        postal_code: '',
        country: ''
      };
      
      // Update billing information in our database
      await prisma.workspace_billing_infos.upsert({
        where: {
          workspace_id: parseInt(workspaceId)
        },
        update: {
          billing_email: customer.email || '',
          billing_address: [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.postal_code,
            address.country,
          ].filter(Boolean).join('\n'),
          tax_rate: workspace.billing_infos?.tax_rate || 20.00, // Keep existing tax rate or use default
          vat_number: customer.tax_ids?.data[0]?.value || null,
        },
        create: {
          workspace_id: parseInt(workspaceId),
          billing_email: customer.email || '',
          billing_address: [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.postal_code,
            address.country,
          ].filter(Boolean).join('\n'),
          tax_rate: 20.00, // Default tax rate
          vat_number: customer.tax_ids?.data[0]?.value || null,
        },
      });

      // Get payment method if available
      let paymentMethod = null;
      const paymentMethods = await stripe.paymentMethods.list({
        customer: workspace.stripe_customer_id,
        type: 'card',
        limit: 1,
      });

      if (paymentMethods.data.length > 0) {
        const card = paymentMethods.data[0].card;
        if (card) {
          paymentMethod = {
            brand: card.brand,
            last4: card.last4,
            expiry_month: card.exp_month,
            expiry_year: card.exp_year,
          };
        }
      }

      // Return the formatted billing information
      return NextResponse.json({
        billing_email: customer.email || '',
        address_line1: address.line1 || '',
        address_line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country_code: address.country || '',
        tax_rate: workspace.billing_infos?.tax_rate || 20.00,
        vat_number: customer.tax_ids?.data[0]?.value || null,
        payment_method: paymentMethod,
      });

    } catch (stripeError) {
      conditionalErrorLog('Error fetching Stripe customer details:', stripeError);
      // If there's an error with Stripe, return the local billing info if available
      if (workspace.billing_infos) {
        const addressParts = workspace.billing_infos.billing_address.split('\n');
        return NextResponse.json({
          billing_email: workspace.billing_infos.billing_email,
          address_line1: addressParts[0] || '',
          address_line2: addressParts[1] || '',
          city: addressParts[2] || '',
          state: addressParts[3] || '',
          postal_code: addressParts[4] || '',
          country_code: addressParts[5] || '',
          tax_rate: workspace.billing_infos.tax_rate,
          vat_number: workspace.billing_infos.vat_number,
        });
      }
      throw stripeError;
    }
  } catch (error) {
    conditionalErrorLog('Error in billing-info endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}

// POST to create/update billing info
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body: BillingInfoRequest = await request.json();
    const { 
      workspaceId, 
      billing_email, 
      billing_address,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country_code,
      tax_rate, 
      vat_number 
    } = body;

    if (!workspaceId || !billing_email || !address_line1 || !city || !postal_code || !country_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has access to this workspace
    const userWorkspace = await prisma.user_workspace.findFirst({
      where: {
        user_id: dbUser.id,
        workspace_id: workspaceId,
        role: 'ADMIN',
      },
    });

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Unauthorized access to workspace' }, { status: 403 });
    }

    // Get the workspace to access Stripe customer ID
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { stripe_customer_id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    let stripeUpdateStatus: { success: boolean; error: string | null } = { 
      success: false, 
      error: null 
    };

    // If we have a Stripe customer ID, update their billing information in Stripe
    if (workspace.stripe_customer_id) {
      try {
        conditionalLog('Updating Stripe customer:', workspace.stripe_customer_id, {
          email: billing_email,
          address: {
            line1: address_line1,
            line2: address_line2,
            city,
            state,
            postal_code,
            country: country_code,
          }
        });

        // Update the customer's basic info
        const updatedCustomer = await stripe.customers.update(workspace.stripe_customer_id, {
          email: billing_email,
          address: {
            line1: address_line1,
            line2: address_line2 || undefined,
            city,
            state: state || undefined,
            postal_code,
            country: country_code,
          },
        });

        conditionalLog('Stripe customer update response:', updatedCustomer);

        // Handle VAT number for EU countries
        if (vat_number) {
          conditionalLog('Updating VAT number for customer:', workspace.stripe_customer_id);
          
          // First, list existing tax IDs
          const existingTaxIds = await stripe.customers.listTaxIds(workspace.stripe_customer_id);
          conditionalLog('Existing tax IDs:', existingTaxIds.data);
          
          // Delete existing EU VAT tax IDs
          for (const taxId of existingTaxIds.data) {
            if (taxId.type === 'eu_vat') {
              conditionalLog('Deleting existing VAT ID:', taxId.id);
              await stripe.customers.deleteTaxId(workspace.stripe_customer_id, taxId.id);
            }
          }
          
          // Create new tax ID
          const newTaxId = await stripe.customers.createTaxId(workspace.stripe_customer_id, {
            type: 'eu_vat',
            value: vat_number,
          });
          conditionalLog('Created new tax ID:', newTaxId);
        }

        stripeUpdateStatus.success = true;
      } catch (stripeError) {
        conditionalErrorLog('Error updating Stripe customer:', {
          error: stripeError,
          customerId: workspace.stripe_customer_id,
          requestData: {
            email: billing_email,
            address: {
              line1: address_line1,
              line2: address_line2,
              city,
              state,
              postal_code,
              country: country_code,
            },
            vatNumber: vat_number
          }
        });
        
        stripeUpdateStatus.error = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error';
      }
    }

    // Upsert billing info in database
    const billingInfo = await prisma.workspace_billing_infos.upsert({
      where: {
        workspace_id: workspaceId,
      },
      update: {
        billing_email,
        billing_address,
        tax_rate,
        vat_number,
      },
      create: {
        workspace_id: workspaceId,
        billing_email,
        billing_address,
        tax_rate,
        vat_number,
      },
    });

    return NextResponse.json({
      ...billingInfo,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country_code,
      stripeUpdate: stripeUpdateStatus
    });
  } catch (error) {
    conditionalErrorLog('Error updating billing info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 