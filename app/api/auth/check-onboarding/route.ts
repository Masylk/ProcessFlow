import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/auth/check-onboarding:
 *   get:
 *     summary: Check onboarding status for the authenticated user
 *     description: Returns the current onboarding step and whether onboarding is completed for the authenticated user.
 *     tags:
 *       - Auth
 *     security:
 *       - supabaseAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 onboardingStep:
 *                   type: string
 *                   example: PERSONAL_INFO
 *                 completed:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not authenticated
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  // Utiliser getUser() au lieu de getSession()
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const userInfo = await prisma_client.user.findUnique({
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
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 