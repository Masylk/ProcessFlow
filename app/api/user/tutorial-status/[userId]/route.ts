import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

interface TutorialStatusRequest {
  hasCompletedTutorial: boolean;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
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

    const dbUser = await prisma_client.user.findFirst({
      where: {
        auth_id: user.id
      },
      select: {
        id: true,
        tutorial_completed: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ hasCompletedTutorial: dbUser.tutorial_completed });
  } catch (error) {
    console.error('Error fetching tutorial status:', error);
    return NextResponse.json({ error: 'Failed to fetch tutorial status' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
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

    // Basic request validation
    const body = await request.json();
    if (typeof body.hasCompletedTutorial !== 'boolean') {
      return NextResponse.json({ 
        error: 'Invalid request body: hasCompletedTutorial must be a boolean'
      }, { status: 400 });
    }

    const { hasCompletedTutorial } = body as TutorialStatusRequest;

    // Use transaction to ensure both updates succeed or fail together
    const result = await prisma_client.$transaction(async (tx) => {
      const dbUser = await tx.user.findFirst({
        where: {
          auth_id: user.id
        },
        select: {
          id: true
        }
      });

      if (!dbUser) {
        throw new Error('User not found');
      }

      if (dbUser.id.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      await tx.user.update({
        where: {
          id: dbUser.id
        },
        data: {
          tutorial_completed: hasCompletedTutorial
        }
      });

      return dbUser;
    });

    // Update Supabase user metadata
    await supabase.auth.updateUser({
      data: {
        tutorial_status: {
          completed: hasCompletedTutorial,
          completed_at: hasCompletedTutorial ? new Date().toISOString() : null
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tutorial status:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to update tutorial status' }, { status: 500 });
  }
} 