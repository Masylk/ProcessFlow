import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the user from Prisma using auth_id
    const [dbUser] = await prisma.$queryRaw<{ id: number; tutorial_completed: boolean }[]>`
      SELECT id, tutorial_completed 
      FROM "user" 
      WHERE auth_id = ${user.id}
    `;

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the requested userId matches the user's actual ID
    if (dbUser.id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ hasCompletedTutorial: dbUser.tutorial_completed });
  } catch (error) {
    console.error('Error fetching tutorial status:', error);
    return NextResponse.json({ error: 'Failed to fetch tutorial status' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the user from Prisma using auth_id
    const [dbUser] = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id 
      FROM "user" 
      WHERE auth_id = ${user.id}
    `;

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the requested userId matches the user's actual ID
    if (dbUser.id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Update the tutorial status
    await prisma.$executeRaw`
      UPDATE "user" 
      SET tutorial_completed = ${body.hasCompletedTutorial}
      WHERE id = ${dbUser.id}
    `;

    // Update Supabase user metadata
    await supabase.auth.updateUser({
      data: {
        tutorial_status: {
          completed: body.hasCompletedTutorial,
          completed_at: body.hasCompletedTutorial ? new Date().toISOString() : null
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tutorial status:', error);
    return NextResponse.json({ error: 'Failed to update tutorial status' }, { status: 500 });
  }
} 