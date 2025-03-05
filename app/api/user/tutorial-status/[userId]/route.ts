import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .select('has_completed_tutorial')
      .eq('id', params.userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ hasCompletedTutorial: data?.has_completed_tutorial ?? false });
  } catch (error) {
    console.error('Error fetching tutorial status:', error);
    return NextResponse.json({ error: 'Failed to fetch tutorial status' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { error } = await supabase
      .from('users')
      .update({ has_completed_tutorial: body.hasCompletedTutorial })
      .eq('id', params.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tutorial status:', error);
    return NextResponse.json({ error: 'Failed to update tutorial status' }, { status: 500 });
  }
} 