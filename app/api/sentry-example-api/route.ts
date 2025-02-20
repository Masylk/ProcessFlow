// app/api/sentry-example-api/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sentry-example-api:
 *   get:
 *     summary: Test Sentry error monitoring
 *     description: A faulty API route that throws an error to test Sentry's error monitoring.
 *     responses:
 *       500:
 *         description: Internal server error caused by an intentional error for Sentry testing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sentry Example API Route Error"
 */
export function GET() {
  throw new Error('Sentry Example API Route Error');
  return NextResponse.json({ data: 'Testing Sentry Error...' });
}
