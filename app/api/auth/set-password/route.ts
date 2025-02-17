import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * @swagger
 * /api/auth/set-password:
 *   post:
 *     summary: Set a new password for a user
 *     description: Updates the user's password using a provided token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token received for password reset.
 *               password:
 *                 type: string
 *                 description: The new password to be set.
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *                 user:
 *                   type: object
 *                   description: Updated user data.
 *       400:
 *         description: Bad request, missing token or password, or error from Supabase.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token and password are required
 */
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required' },
      { status: 400 }
    );
  }

  // Initialize Supabase client
  const supabase = await createClient();

  // Use the token to update the user's password
  const { data: user, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: 'Password updated successfully.', user },
    { status: 200 }
  );
}
