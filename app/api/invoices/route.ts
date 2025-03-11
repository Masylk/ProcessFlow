import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabaseServerClient';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Get user session using Supabase
    const cookieStore = cookies();
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (!session || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: parseInt(workspaceId),
        user_workspaces: {
          some: {
            user: {
              auth_id: session.user.id
            }
          }
        }
      },
      select: {
        id: true,
        stripe_customer_id: true
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (!workspace.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: workspace.stripe_customer_id,
      limit: 100, // Adjust as needed
    });

    // Format invoices for response
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      created: invoice.created,
      status: invoice.status,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
      plan: invoice.lines.data[0]?.plan?.nickname || 'Early Adopter'
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 