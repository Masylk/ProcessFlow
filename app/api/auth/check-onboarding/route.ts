import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  // Utiliser getUser() au lieu de getSession()
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const userInfo = await prisma.user.findUnique({
      where: { auth_id: user.id },
      select: {
        onboarding_step: true,
        onboarding_completed_at: true
      }
    });

    return NextResponse.json({
      onboardingStep: userInfo?.onboarding_step || 'PERSONAL_INFO',
      completed: !!userInfo?.onboarding_completed_at
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 