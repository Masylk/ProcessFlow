// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

/**
 * @swagger
 * /api/auth/confirm:
 *   get:
 *     summary: Confirm OTP token and handle authentication flow
 *     description: Verifies the OTP token and redirects the user to the appropriate page based on the token type.
 *     tags:
 *       - Auth
 *     parameters:
 *       - name: token_hash
 *         in: query
 *         required: true
 *         description: The hashed token to verify the OTP
 *         schema:
 *           type: string
 *           example: "abcd1234hashvalue"
 *       - name: type
 *         in: query
 *         required: true
 *         description: The type of the OTP ('recovery' for password reset or 'email' for email confirmation)
 *         schema:
 *           type: string
 *           enum:
 *             - recovery
 *             - email
 *           example: "recovery"
 *       - name: next
 *         in: query
 *         required: false
 *         description: URL to redirect to after successful authentication (defaults to "/")
 *         schema:
 *           type: string
 *           example: "/dashboard"
 *     responses:
 *       200:
 *         description: Redirect to the appropriate page after successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *                   example: "/dashboard"
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid parameters"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to verify OTP"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as string | null; // Allow string type
  const next = searchParams.get('next') ?? '/';

  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType, // Ensure this is cast to EmailOtpType
      token_hash,
    });

    if (!error) {
      console.log('auth successful !');
      if (type === 'recovery') {
        console.log('redirect to recovery process !');
        // Construct an absolute URL for the reset-password page
        const redirectUrl = `${baseUrl}/reset-password?token_hash=${token_hash}`;

        // Set the password-reset-required cookie
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set('password-reset-required', 'true', { path: '/' });
        return response;
      } else {
        // Redirect to the next page
        const nextUrl = next.startsWith('/') ? `${baseUrl}${next}` : next;
        return NextResponse.redirect(nextUrl);
      }
    } else {
      // Redirect to the error page with an absolute URL
      const errorUrl = `${baseUrl}/error?message=${encodeURIComponent(
        error.message
      )}`;
      return NextResponse.redirect(errorUrl);
    }
  }

  // Redirect to the error page for invalid parameters
  const errorUrl = `${baseUrl}/error?message=Invalid%20parameters`;
  return NextResponse.redirect(errorUrl);
}
