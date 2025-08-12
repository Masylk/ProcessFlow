// app/api/clear-password-reset-cookie/route.ts
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/clear-password-reset-cookie:
 *   post:
 *     summary: Clears the password reset required cookie
 *     description: Removes the "password-reset-required" cookie by setting its expiration date to the past.
 *     responses:
 *       200:
 *         description: Successfully cleared the cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('password-reset-required', '', {
    path: '/',
    expires: new Date(0), // Expire the cookie immediately
  });
  return response;
}
