import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/clear-reset-cookies:
 *   post:
 *     summary: Clear password reset cookies
 *     description: Removes password reset-related cookies from the client.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Cookies cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cookies cleared
 */

export async function POST() {
  const response = NextResponse.json({ message: 'Cookies cleared' });
  
  // Clear all reset-related cookies
  response.cookies.delete('password-reset-token');
  response.cookies.delete('reset-user-id');
  
  return response;
} 