// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client
import prisma from '@/lib/prisma'; // Import your Prisma client
import { supabase } from '@/lib/supabaseClient'; // Already imported in your signed url util
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { generatePublicUrl } from '../utils/generatePublicUrl';

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get authenticated user details
 *     description: Retrieves the authenticated user's details from Supabase and matches it with the Prisma user record. If the user's email in Supabase differs, it updates the Prisma record.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 auth_id:
 *                   type: string
 *                   example: "7f9c47d1-1234-4f86-9b98-b76d8f4d57a1"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 last_name:
 *                   type: string
 *                   example: "Doe"
 *                 full_name:
 *                   type: string
 *                   example: "John Doe"
 *                 avatar_url:
 *                   type: string
 *                   nullable: true
 *                   example: "https://example.com/avatar.jpg"
 *                 active_workspace:
 *                   type: integer
 *                   nullable: true
 *                   example: 3
 *       400:
 *         description: No email found in Supabase user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No email found in Supabase user data"
 *       401:
 *         description: User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: User not found in Prisma database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Get the user from Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData || !userData.user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabaseUser = userData.user;
  const userId = supabaseUser.id; // Supabase UID
  const supabaseEmail = supabaseUser.email;

  if (!supabaseEmail) {
    return NextResponse.json(
      { error: 'No email found in Supabase user data' },
      { status: 400 }
    );
  }

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Fetch the Prisma user based on the Supabase UID
    const user = await prisma_client.user.findUnique({
      where: {
        auth_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let avatar_signed_url: string | null = null;
    if (user.avatar_url && !user.avatar_url.startsWith('http')) {
      try {
        avatar_signed_url = generatePublicUrl(user.avatar_url);
      } catch (error) {
        console.error('Error generating public URL for avatar:', error);
      }
    }

    // If the email differs, update the Prisma user record
    if (user.email !== supabaseEmail) {
      const updatedUser = await prisma_client.user.update({
        where: { auth_id: userId },
        data: {
          email: supabaseEmail,
        },
      });
      // Add avatar_signed_url to updatedUser before returning
      return NextResponse.json({ ...updatedUser, avatar_signed_url });
    }

    return NextResponse.json({ ...user, avatar_signed_url });
  } catch (dbError) {
    console.error('Error fetching or updating user from Prisma:', dbError);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
