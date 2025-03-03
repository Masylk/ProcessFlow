import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching subscription for user:', userId);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // First get the workspace ID for the user
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspace')
      .select('id')
      .eq('user_id', userId)
      .single();

    console.log('Workspace query result:', { workspace, workspaceError });

    if (workspaceError || !workspace) {
      console.log('No workspace found for user:', userId);
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Then get the subscription for that workspace
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscription')
      .select('*')
      .eq('workspace_id', workspace.id)
      .single();

    if (subscriptionError) {
      return NextResponse.json({ error: 'Error fetching subscription' }, { status: 500 });
    }

    if (!subscription) {
      return NextResponse.json({ 
        plan_type: 'free',
        status: 'active'
      });
    }

    return NextResponse.json({
      plan_type: subscription.plan_type,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      stripe_subscription_id: subscription.stripe_subscription_id
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}