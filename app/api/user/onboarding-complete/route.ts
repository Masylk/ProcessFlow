import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isVercel } from '../../utils/isVercel';
import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    const { data, error } = await supabaseAdmin.auth.updateUser({
      data: {
        onboarding_status: {
          current_step: 'completed',
          completed_at: new Date().toISOString(),
        },
        user_metadata: {
          onboarding_status: {
            current_step: 'completed',
            completed_at: new Date().toISOString(),
          },
        },
      },
    });
    if (error) throw error;
    await prisma_client.user.update({
      where: { auth_id: userId },
      data: {
        onboarding_step: 'COMPLETED',
        onboarding_completed_at: new Date().toISOString(),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
